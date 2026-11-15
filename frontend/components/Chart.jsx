"use client";
import { useEffect, useRef } from "react";

// Plotly loads only in the browser, so the server render stays light.
export default function Chart({ dates, values, title, unit, trendLine }) {
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Plotly = (await import("plotly.js-dist-min")).default;
      if (cancelled || !ref.current) return;
      const isLight = document.documentElement.dataset.theme === "light";
      const text = isLight ? "#161616" : "#efefef";
      const grid = isLight ? "rgba(56, 56, 56, 0.12)" : "rgba(166, 166, 166, 0.12)";
      const traces = [{
        x: dates, y: values, type: "scatter", mode: "lines", name: "Measured",
        line: { color: "#afafaf", width: 2 },
        hovertemplate: `%{x}<br>%{y:.2f} ${unit}<extra></extra>`,
      }];
      if (trendLine && trendLine.length) {
        traces.push({
          x: dates, y: trendLine, type: "scatter", mode: "lines", name: "Trend",
          line: { color: "#c1c1c1", width: 3, dash: "dot" }, hoverinfo: "skip",
        });
      }
      Plotly.newPlot(ref.current, traces, {
        title: { text: title, font: { size: 16, color: text } },
        paper_bgcolor: "rgba(0, 0, 0, 0)", plot_bgcolor: "rgba(0, 0, 0, 0)",
        font: { family: "system-ui, sans-serif", color: text },
        margin: { l: 56, r: 20, t: 52, b: 44 },
        xaxis: { gridcolor: grid, rangeslider: { visible: false } },
        yaxis: { title: unit, gridcolor: grid, zerolinecolor: grid },
        legend: { orientation: "h", y: -0.18 },
        hovermode: "x unified",
      }, { responsive: true, displayModeBar: false });
    })();
    return () => { cancelled = true; };
  }, [dates, values, title, unit, trendLine]);

  return (
    <div className="chart-box" role="img" aria-label={`${title}. Line chart of ${values?.length || 0} points.`}>
      <div ref={ref} className="plot" />
    </div>
  );
}
