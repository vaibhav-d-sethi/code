"use client";
import { useState } from "react";

// Shows a photo from /public/photos. If the file is missing, it shows the given fallback art instead.
export default function Photo({ src, alt, credit, fallback, height = 260 }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="photo" style={{ margin: 0, height }}>
      {!failed && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />
      ) : (
        <div style={{ height: "100%" }} role="img" aria-label={alt}>{fallback}</div>
      )}
      {credit && <figcaption>{credit}</figcaption>}
    </figure>
  );
}
