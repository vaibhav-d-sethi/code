// Inline SVG icons. Each is decorative unless a label is passed.
const PATHS = {
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20",
  chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
  chat: "M4 5h16v11H8l-4 4z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  cloud: "M7 18a5 5 0 110-10 6 6 0 0111.5 1.5A4 4 0 0118 18H7zM12 11v6m-3-3 3 3 3-3",
  book: "M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z",
  sun: "M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 3 2 21h20zM12 10v5m0 3v.5",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  layers: "M12 3 2 8l10 5 10-5zM2 16l10 5 10-5",
  search: "M11 4a7 7 0 110 14 7 7 0 010-14zM20 20l-4-4",
  cpu: "M9 9h6v6H9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2",
  rocket: "M5 19l3-1 1-3 6-6a4 4 0 00-6-6l-6 6-3 1zM14 6l4 4M9 15l-3 3",
};

export default function Icon({ name, size = 22, label }) {
  const d = PATHS[name] || PATHS.globe;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} focusable="false">
      <path d={d} />
    </svg>
  );
}
