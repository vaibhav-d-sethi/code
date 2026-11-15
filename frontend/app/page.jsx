import Link from "next/link";
import Icon from "@/components/Icon";
import CityArt from "@/components/CityArt";
import Photo from "@/components/Photo";
import GlobePicker from "@/components/GlobePicker";
import AskPanel from "@/components/AskPanel";
import { CITY_BLURB } from "@/lib/cityArt";

const CITIES = ["lucknow", "jaisalmer", "kochi", "shimla", "leh"];
const NAMES = { lucknow: "Lucknow", jaisalmer: "Jaisalmer", kochi: "Kochi", shimla: "Shimla", leh: "Leh" };

const STEPS = [
  { title: "Pick a variable", text: "Air temperature or rainfall, from NASA's MERRA-2 reanalysis." },
  { title: "Pick a place", text: "Five Indian cities, from the Gangetic plain to the Ladakh highlands." },
  { title: "Pick the years", text: "Any years from 1980 to 2019: 480 monthly values per city." },
  { title: "Test the change", text: "Mann-Kendall trend test with Sen's slope, corrected for autocorrelation (Hamed and Rao, 1998)." },
  { title: "Read the answer", text: "A chart, the numbers, and a plain explanation with one caveat." },
];

const FEATURES = [
  { icon: "chat", title: "Plain questions", text: "Ask “was Leh wetter lately?” It becomes a plan the code can check." },
  { icon: "shield", title: "The maths is in Python", text: "Every number is computed in code. The language model only explains the result." },
  { icon: "cloud", title: "Fresh NASA data", text: "Fetch MERRA-2 values from NASA Earthdata for any box and year range." },
  { icon: "layers", title: "Seasons removed", text: "Each month is compared with its own average, so summer heat is not read as a trend." },
];

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="reveal">
            <p className="eyebrow">NASA Space Apps Challenge 2026 · Earth Science</p>
            <h1 id="hero-title">Has your city really changed? <span className="hero-accent">Check the data.</span></h1>
            <p className="lede" style={{ marginTop: 16 }}>
              Pick a city and a climate variable. See how it changed since 1980, how fast, and whether the change
              is statistically significant, using NASA’s MERRA-2 reanalysis.
            </p>
            <div className="row" style={{ marginTop: 28 }}>
              <Link href="/explore" className="btn">Explore the data</Link>
              <Link href="/presets" className="btn ghost">Browse presets</Link>
            </div>
            <dl className="facts">
              {[["40", "years of monthly data"], ["5", "Indian cities"], ["2", "climate variables"], ["3 days", "live forecast"]].map(([n, l]) => (
                <div key={l}>
                  <dt>{l}</dt>
                  <dd>{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="globe-col"><GlobePicker /></div>
        </div>
      </section>

      <section className="section ask-zone" id="ask" aria-labelledby="ask-title">
        <div className="container">
          <p className="eyebrow">Ask</p>
          <h2 id="ask-title">Ask a question about the record</h2>
          <p className="lede" style={{ marginBottom: 24 }}>
            Name one city and one variable. You will get a plain answer and the numbers behind it.
          </p>
          <div className="glass ask-glass">
            <AskPanel />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">Five steps, from question to answer</h2>
          <ol className="steps" style={{ marginTop: 24 }}>
            {STEPS.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="cities-title">
        <div className="container">
          <p className="eyebrow">Five places</p>
          <h2 id="cities-title">Pick a city to start</h2>
          <div className="grid grid-3" style={{ marginTop: 24 }}>
            {CITIES.map((id) => (
              <Link key={id} href={`/explore?city=${id}`} className="card city-card lift" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="city-art"><CityArt id={id} /></div>
                <div className="city-body">
                  <h3>{NAMES[id]}</h3>
                  <p style={{ margin: 0, fontSize: "0.92rem" }}>{CITY_BLURB[id]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="features-title">
        <div className="container grid split">
          <div className="grid grid-2" style={{ gap: 16 }}>
            {FEATURES.map((f) => (
              <article key={f.title} className="card lift">
                <div className="icon"><Icon name={f.icon} /></div>
                <h3>{f.title}</h3>
                <p style={{ margin: 0, fontSize: "0.94rem" }}>{f.text}</p>
              </article>
            ))}
          </div>
          <div>
            <p className="eyebrow">Why it matters</p>
            <h2 id="features-title">Trends are easy to see by eye, and easy to fool yourself with</h2>
            <p>A hot summer is not a warming trend. A wet year is not a wetter climate. We remove the seasonal cycle first, then ask whether the remaining change is bigger than the year-to-year noise.</p>
            <p>Every answer shows the p-value, the rate, the periods compared, and a caveat, so you can judge it yourself.</p>
            <div className="row" style={{ marginTop: 8 }}>
              <Link href="/method" className="btn ghost">Read the method</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="photos-title">
        <div className="container">
          <p className="eyebrow">From space</p>
          <h2 id="photos-title">The Earth we are measuring</h2>
          <div className="grid grid-3" style={{ marginTop: 24 }}>
            <Photo
              src="/photos/earth-night.jpg"
              alt="India at night seen from orbit"
              credit="NASA Earth Observatory. ISS photo by the ISS Crew Earth Observations Facility, Johnson Space Center."
              height={240}
              fallback={<div style={{ height: "100%", background: "#191919" }} />}
            />
            <Photo
              src="/photos/himalaya.jpg"
              alt="Himalayan peaks and rivers"
              credit="NASA images courtesy LANCE/EOSDIS MODIS Rapid Response Team, GSFC."
              height={240}
              fallback={<div style={{ height: "100%", padding: 0 }}><CityArt id="shimla" /></div>}
            />
            <Photo
              src="/photos/thar-desert.jpg"
              alt="Dust over the Thar Desert"
              credit="NASA image by Jeff Schmaltz, MODIS Rapid Response Team, GSFC."
              height={240}
              fallback={<div style={{ height: "100%", padding: 0 }}><CityArt id="jaisalmer" /></div>}
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cta-title">
        <div className="container card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h2 id="cta-title">Ready to look closer?</h2>
          <p className="lede" style={{ margin: "0 auto 24px" }}>Start with a preset question, or compute your own area from NASA.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link href="/presets" className="btn">Browse presets</Link>
            <Link href="/compute" className="btn ghost">Compute from NASA Earthdata</Link>
          </div>
        </div>
      </section>
    </>
  );
}
