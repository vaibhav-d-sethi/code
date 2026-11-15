"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Cesium loads from a CDN only in the browser. The token comes from NEXT_PUBLIC_CESIUM_TOKEN in .env.local.
const CESIUM_BASE = "https://cdn.jsdelivr.net/npm/cesium@1/Build/Cesium/";
const MAX_PINS = 1;
const STORAGE_KEY = "cs-pins";

function loadCesium() {
  return new Promise((resolve, reject) => {
    if (window.Cesium) return resolve(window.Cesium);
    window.CESIUM_BASE_URL = CESIUM_BASE;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CESIUM_BASE + "Widgets/widgets.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = CESIUM_BASE + "Cesium.js";
    script.onload = () => resolve(window.Cesium);
    script.onerror = () => reject(new Error("Could not load the 3D globe. Check your internet connection."));
    document.head.appendChild(script);
  });
}

// Great-circle distance in kilometres between two points.
export function distanceKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function GlobePicker() {
  const hostRef = useRef(null);
  const viewerRef = useRef(null);
  const [pins, setPins] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  // Restore pins saved earlier in this browser.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setPins(saved.slice(0, MAX_PINS));
    } catch { /* ignore bad saved data */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pins)); } catch { /* storage off */ }
  }, [pins]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
    if (!token) { setStatus("no-token"); return; }
    let viewer, handler, cancelled = false;
    loadCesium().then((Cesium) => {
      if (cancelled) return;
      Cesium.Ion.defaultAccessToken = token;
      viewer = new Cesium.Viewer(hostRef.current, {
        animation: false, timeline: false, baseLayerPicker: false, geocoder: false,
        homeButton: false, sceneModePicker: false, navigationHelpButton: false,
        infoBox: false, selectionIndicator: false,
      });
      viewer.scene.globe.enableLighting = true;
      viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(78, 22, 9_000_000) });
      viewerRef.current = viewer;

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click) => {
        const cart = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (!cart) return;
        const c = Cesium.Cartographic.fromCartesian(cart);
        const pin = {
          name: `Pin ${Date.now() % 1000}`,
          lat: Number(Cesium.Math.toDegrees(c.latitude).toFixed(4)),
          lon: Number(Cesium.Math.toDegrees(c.longitude).toFixed(4)),
        };
        setMessage("");
        setPins([pin]);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      setStatus("ready");
    }).catch((err) => { if (!cancelled) { setStatus("error"); setMessage(err.message); } });

    return () => {
      cancelled = true;
      if (handler) handler.destroy();
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  // Keep the markers on the globe in step with the pin list.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;
    viewer.entities.removeAll();
    pins.forEach((p, i) => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
        point: { pixelSize: 12, color: Cesium.Color.fromCssColorString("#c1c1c1"), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: {
          text: `${i + 1}. ${p.name}`, font: "14px system-ui", fillColor: Cesium.Color.WHITE,
          pixelOffset: new Cesium.Cartesian2(0, -18), showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#131313").withAlpha(0.8),
        },
      });
    });
  }, [pins, status]);

  function rename(i, name) {
    setPins((prev) => prev.map((p, j) => (j === i ? { ...p, name: name.slice(0, 40) } : p)));
  }
  function remove(i) {
    setPins((prev) => prev.filter((_, j) => j !== i));
  }

  return (
    <div className="globe-wrap">
      <div className="globe-stage">
        {status === "no-token" && (
          <div className="globe-fallback">
            <h3>3D globe needs a Cesium token</h3>
            <p>Add <code>NEXT_PUBLIC_CESIUM_TOKEN</code> to <code>frontend/.env.local</code> and restart the site.</p>
          </div>
        )}
        {status === "error" && (
          <div className="globe-fallback"><h3>Globe unavailable</h3><p>{message}</p></div>
        )}
        {status === "loading" && <div className="globe-fallback"><p>Loading globe…</p></div>}
        <div ref={hostRef} className="globe-canvas" role="application" aria-label="3D globe. Click to drop a pin." />
      </div>

      <div className="pin-panel">
        <div className="row spread" style={{ marginBottom: 8 }}>
          <strong>Your pin</strong>
          <span className="hint">Click the globe to move the pin</span>
        </div>
        {message && <p className="hint over" role="status">{message}</p>}
        {pins.length === 0 && <p className="hint">No pin yet. Click anywhere on the globe.</p>}
        <ol className="pin-list">
          {pins.map((p, i) => {
            return (
              <li key={i}>
                <div className="pin-row">
                  <span className="pin-badge">{i + 1}</span>
                  <input type="text" aria-label={`Name for pin ${i + 1}`} value={p.name}
                    onChange={(e) => rename(i, e.target.value)} />
                  <button className="icon-btn" aria-label={`Remove pin ${i + 1}`} onClick={() => remove(i)}>×</button>
                </div>
                <div className="pin-meta">
                  Lat {p.lat}, Lon {p.lon}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn small" href="/compute">Compute an area from this pin</Link>
          {pins.length > 0 && <button className="btn ghost small" onClick={() => { setPins([]); setMessage(""); }}>Remove pin</button>}
        </div>
      </div>
    </div>
  );
}
