import Link from "next/link";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-3">
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <Icon name="globe" size={28} />
            <strong>Circuit Sages</strong>
          </div>
          <p className="credit">Team Circuit Sages, Lucknow. Built for the NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!</p>
        </div>
        <ul aria-label="Footer">
          <li><Link href="/explore">Explore the data</Link></li>
          <li><Link href="/ask">Ask a question</Link></li>
          <li><Link href="/compute">Compute from NASA Earthdata</Link></li>
          <li><Link href="/method">How it works and sources</Link></li>
        </ul>
        <p className="credit">
          Data: NASA MERRA-2, GES DISC. Plots: Plotly.js. Explanations are written by a language model; all statistics are computed in Python.
          NASA logos are not used on this site.
        </p>
      </div>
    </footer>
  );
}
