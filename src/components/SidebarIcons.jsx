const ICON_PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-5 5" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </>
  ),
  desk: (
    <>
      <path d="M3 21h18M5 21V8h14v13M3 8h18M8 8V4h8v4" />
      <path d="M9 13h6" />
    </>
  ),
  bed: (
    <>
      <path d="M3 5v16M3 12h18v9M21 16v5" />
      <path d="M7 12V8h5a4 4 0 0 1 4 4M3 16h18" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  close: (
    <>
      <path d="m18 6-12 12M6 6l12 12" />
    </>
  ),
  collapse: (
    <>
      <path d="m15 18-6-6 6-6" />
    </>
  ),
  expand: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </>
  ),
};

export default function SidebarIcon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name] || null}
    </svg>
  );
}
