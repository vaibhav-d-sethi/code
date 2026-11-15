import { CITY_ART } from "@/lib/cityArt";

// A simple landscape illustration for each city. Decorative, so it is hidden from screen readers.
export default function CityArt({ id }) {
  const a = CITY_ART[id] || CITY_ART.lucknow;
  const gid = `g-${id}`;
  return (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a.sky[0]} />
          <stop offset="1" stopColor={a.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="320" height="120" fill={`url(#${gid})`} />
      <circle cx="262" cy="34" r="16" fill="#ffffff" opacity="0.85" />
      {a.motif === "river" && (
        <>
          <path d="M0 80 Q80 66 160 82 T320 78 V120 H0Z" fill={a.ground} opacity="0.85" />
          <path d="M0 98 Q90 88 170 100 T320 96" stroke="#dedede" strokeWidth="5" fill="none" opacity="0.7" />
        </>
      )}
      {a.motif === "dunes" && (
        <>
          <path d="M0 78 Q60 58 120 76 T240 72 T320 70 V120 H0Z" fill="#e4e4e4" opacity="0.9" />
          <path d="M0 98 Q90 84 180 98 T320 94 V120 H0Z" fill={a.ground} opacity="0.85" />
        </>
      )}
      {a.motif === "palms" && (
        <>
          <path d="M0 96 Q160 84 320 96 V120 H0Z" fill="#606060" opacity="0.9" />
          <path d="M40 96 q6-30 -4-44 M40 60 q-16-6 -26 6 M40 60 q14-10 26 4 M40 60 q-4-14 6-22" stroke="#4a4a4a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M270 98 q4-26 -6-38 M270 66 q-16-4 -24 8 M270 66 q14-6 24 4" stroke="#4a4a4a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {a.motif === "peaks" && (
        <>
          <path d="M0 110 L70 42 L120 90 L170 30 L230 96 L270 56 L320 110Z" fill="#e7e7e7" opacity="0.9" />
          <path d="M70 42 L58 58 L82 56Z M170 30 L154 52 L186 52Z" fill="#ffffff" />
        </>
      )}
      {a.motif === "ranges" && (
        <>
          <path d="M0 110 L60 56 L110 86 L160 46 L220 90 L280 52 L320 80 V120 H0Z" fill="#a1a1a1" opacity="0.9" />
          <path d="M160 46 L146 62 L172 60Z M280 52 L266 66 L294 66Z" fill="#fafafa" />
        </>
      )}
    </svg>
  );
}
