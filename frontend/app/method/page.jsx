import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = { title: "Method and sources" };

export default function MethodPage() {
  return (
    <div className="container section">
      <p className="eyebrow">Method and sources</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>How the answers are made</h1>
      <p className="lede">Plain steps, the statistics behind them, and where every number comes from.</p>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="about-h">
        <h2 id="about-h">About us</h2>
        <div className="grid grid-3">
          {[
            ["Vaibhav Sethi", "Team Leader", "Coding, architecture and development."],
            ["Tauheed Ahmad", "Presentation and technical support", "Anchors the presentation and explains the ideas to the judges."],
            ["Utkarsh Kumar Dubey", "Scientific support and testing", "Handles the science and the testing."],
          ].map(([name, role, text]) => (
            <article key={name} className="card">
              <div className="icon" aria-hidden="true">{name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
              <h3>{name}</h3>
              <p className="eyebrow" style={{ margin: "0 0 8px" }}>{role}</p>
              <p style={{ margin: 0 }}>{text}</p>
            </article>
          ))}
        </div>
        <p className="hint" style={{ marginTop: 16 }}>Circuit Sages · BCA (Data Science and AI), First Year · Lucknow</p>
      </section>

      <section className="section" style={{ paddingTop: 32 }} aria-labelledby="pipe-h">
        <h2 id="pipe-h">The pipeline</h2>
        <div className="grid grid-3">
          {[
            ["chat", "1. Understand", "A language model turns your question into a short plan: city, variable, years. It may only pick from the five cities and two variables, and anything else is refused."],
            ["grid", "2. Compute", "Python loads the monthly series, removes the seasonal cycle, and runs the trend tests. The model never does arithmetic."],
            ["book", "3. Explain", "The model writes at most five plain sentences from the computed numbers, with one caveat. It does not invent figures."],
          ].map(([icon, t, text]) => (
            <article key={t} className="card">
              <div className="icon"><Icon name={icon} /></div>
              <h3>{t}</h3>
              <p style={{ margin: 0 }}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="stats-h">
        <h2 id="stats-h">The statistics</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <caption className="hint" style={{ textAlign: "left", marginBottom: 8 }}>Every test uses p &lt; 0.05 as the threshold for significance.</caption>
            <thead><tr><th scope="col">Measure</th><th scope="col">What it tells you</th></tr></thead>
            <tbody>
              <tr><td>Seasonal anomaly</td><td>Each month minus that month’s average. Removes the normal summer and winter swing.</td></tr>
              <tr><td>Mann-Kendall test</td><td>Whether the values tend to rise or fall over time. Rank-based, so it is robust to outliers.</td></tr>
              <tr><td>Hamed-Rao correction</td><td>Monthly values are linked from one month to the next. This corrects the test so that it does not claim a trend too easily.</td></tr>
              <tr><td>Sen’s slope</td><td>The typical change per decade. Reported in the variable’s unit.</td></tr>
              <tr><td>Welch t-test</td><td>Compares the first ten years of the period with the last ten years.</td></tr>
              <tr><td>p-value</td><td>How likely a change this large would be if there were no real trend. Below 0.05 counts as significant here.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="gold-h">
        <h2 id="gold-h">The standard we use, and where it comes from</h2>
        <div className="card">
          <p>
            Trend work in climate and water science usually runs one combination of tests: a Mann-Kendall test for direction,
            Sen’s slope for size, and a correction for autocorrelation (Hamed and Rao, 1998). We use that combination.
          </p>
          <p>
            The phrase “gold standard” is not tied to one paper for this method. The method is the accepted standard in practice,
            built from these sources:
          </p>
          <ul className="refs">
            <li><strong>Mann, H. B. (1945).</strong> Nonparametric tests against trend. <em>Econometrica</em>, 13(3), 245–259. Proposed the rank-based trend test.</li>
            <li><strong>Kendall, M. G. (1975).</strong> <em>Rank Correlation Methods</em>. Charles Griffin, London. Gave the test its exact distribution and name.</li>
            <li><strong>Sen, P. K. (1968).</strong> Estimates of the regression coefficient based on Kendall’s tau. <em>Journal of the American Statistical Association</em>, 63(324), 1379–1389. Gave the slope estimator.</li>
            <li><strong>Hamed, K. H., &amp; Rao, A. R. (1998).</strong> A modified Mann-Kendall trend test for autocorrelated data. <em>Journal of Hydrology</em>, 204(1–4), 182–196. Gave the autocorrelation correction.</li>
          </ul>
          <p className="credit">The method is also summarised in the Python code: see <code>backend/stats.py</code>.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="data-h">
        <h2 id="data-h">Data sources and credits</h2>
        <div className="grid grid-2">
          <div className="card">
            <h3>NASA MERRA-2</h3>
            <p>Monthly means from the Modern-Era Retrospective analysis for Research and Applications, Version 2, distributed by NASA GES DISC.</p>
            <ul style={{ paddingLeft: 18, color: "var(--muted)" }}>
              <li>M2TMNXSLV: 2-metre air temperature (T2M), converted from kelvin to °C.</li>
              <li>M2TMNXFLX: total precipitation (PRECTOTCORR), converted from kg m⁻² s⁻¹ to mm per month.</li>
            </ul>
            <p className="credit">Citation: Gelaro, R. et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). Journal of Climate, 30, 5419–5454.</p>
          </div>
          <div className="card">
            <h3>Method notes</h3>
            <ul style={{ paddingLeft: 18, color: "var(--muted)" }}>
              <li>Values come from the grid cell nearest each city, so they describe a regional average, not a town.</li>
              <li>Records cover 1980 to 2019: 480 monthly values per city.</li>
              <li>A trend in one city is not a global trend. Check the caveat in every answer.</li>
            </ul>
          </div>
          <div className="card">
            <h3>Software and fonts</h3>
            <ul style={{ paddingLeft: 18, color: "var(--muted)" }}>
              <li>Frontend: Next.js and React. Charts: Plotly.js.</li>
              <li>Backend: FastAPI, pandas, xarray, SciPy, pymannkendall, earthaccess.</li>
              <li>Fonts: system font stack, so no font download is needed.</li>
            </ul>
          </div>
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3>Photo credits</h3>
            <ul style={{ paddingLeft: 18, color: "var(--muted)", columns: "2 320px" }}>
              <li><strong>Earth at night (India):</strong> NASA Earth Observatory. ISS photo by the ISS Crew Earth Observations Facility, JSC.</li>
              <li><strong>Himalaya:</strong> NASA images courtesy LANCE/EOSDIS MODIS Rapid Response Team, GSFC.</li>
              <li><strong>Thar Desert:</strong> NASA image by Jeff Schmaltz, MODIS Rapid Response Team, GSFC.</li>
              <li><strong>Ladakh:</strong> Astronaut photograph ISS070-E-80680, ISS Crew Earth Observations Facility, JSC.</li>
              <li><strong>Kerala coast:</strong> NASA Earth Observatory, ISS photo ISS069-E-82075, JSC.</li>
              <li><strong>Indo-Gangetic Plain:</strong> NASA image by Jeff Schmaltz, LANCE/EOSDIS Rapid Response.</li>
              <li><strong>India monsoon:</strong> NASA Earth Observatory by Joshua Stevens; IMERG data from NASA GPM.</li>
              <li><strong>Air pollution, India:</strong> NASA Earth Observatory by Lauren Dauphin; MODIS data from LANCE/EOSDIS.</li>
              <li><strong>Storm clouds:</strong> credit to be confirmed from the NASA page before submission.</li>
            </ul>
            <p className="credit">NASA logos and branding are not used on this site, in line with the Space Apps rules.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="lm-h">
        <h2 id="lm-h">The language model</h2>
        <div className="card answer">
          <p>
            A language model (served through Groq) is used in two places: to turn a question into a plan, and to write the plain-English explanation.
            The statistics are computed in Python, not by the model.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }} aria-labelledby="limits-h">
        <h2 id="limits-h">Limits</h2>
        <p>
          This is a teaching and exploration tool. Results depend on the 1980 to 2019 window and on a reanalysis, not direct station records.
          Short periods and strong natural variability can hide real change. Always read the p-value with the rate of change.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link className="btn" href="/explore">Explore the data</Link>
          <Link className="btn ghost" href="/ask">Ask a question</Link>
        </div>
      </section>
    </div>
  );
}
