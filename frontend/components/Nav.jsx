"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/ask", label: "Ask" },
  { href: "/presets", label: "Presets" },
  { href: "/compute", label: "Compute" },
  { href: "/method", label: "Method" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("cs-theme");
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.dataset.theme = t;
  }, []);

  useEffect(() => setOpen(false), [path]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("cs-theme", next);
  }

  return (
    <header className="nav">
      <a className="skip" href="#main">Skip to content</a>
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Circuit Sages home">
          <Icon name="globe" size={30} />
          <span>Circuit Sages<small>Earth System Trend Detective</small></span>
        </Link>
        <nav aria-label="Main">
          <ul className={`nav-links ${open ? "open" : ""}`} id="site-menu">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-tools">
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <button className="icon-btn menu-btn" aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
