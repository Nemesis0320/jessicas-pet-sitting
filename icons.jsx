// Minimal inline SVG icons (stroke-based, friendly)
const Icon = ({ d, size = 18, stroke = 2, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const I = {
  home: (p={}) => <Icon size={p.size||18} d={<><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></>}/>,
  paw: (p={}) => <Icon size={p.size||18} d={<><circle cx="6" cy="9" r="1.6"/><circle cx="10" cy="6" r="1.6"/><circle cx="14" cy="6" r="1.6"/><circle cx="18" cy="9" r="1.6"/><path d="M8 16c0-2 2-4 4-4s4 2 4 4-2 3-4 3-4-1-4-3z"/></>}/>,
  pill: (p={}) => <Icon size={p.size||18} d={<><rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/></>}/>,
  bell: (p={}) => <Icon size={p.size||18} d={<><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></>}/>,
  camera: (p={}) => <Icon size={p.size||18} d={<><path d="M3 8h3l2-3h8l2 3h3v11H3z"/><circle cx="12" cy="13" r="3.5"/></>}/>,
  note: (p={}) => <Icon size={p.size||18} d={<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>}/>,
  plus: (p={}) => <Icon size={p.size||18} d={<><path d="M12 5v14M5 12h14"/></>}/>,
  search: (p={}) => <Icon size={p.size||18} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>}/>,
  cog: (p={}) => <Icon size={p.size||18} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.4 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.4l-.1.1A2 2 0 014 17.2l.1-.1a1.7 1.7 0 00.4-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.4-1.8l-.1-.1A2 2 0 016.8 4l.1.1a1.7 1.7 0 001.8.4H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.4l.1-.1A2 2 0 0120 6.8l-.1.1a1.7 1.7 0 00-.4 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></>}/>,
  heart: (p={}) => <Icon size={p.size||18} fill="currentColor" stroke="none" d={<path d="M12 21s-7-4.5-9.5-9C1 9 3 5.5 6.5 5.5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5.5 23 9 21.5 12 19 16.5 12 21 12 21z"/>}/>,
  edit: (p={}) => <Icon size={p.size||18} d={<><path d="M11 4h-7v16h16v-7"/><path d="M18 2l4 4-11 11h-4v-4z"/></>}/>,
  trash: (p={}) => <Icon size={p.size||18} d={<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>}/>,
  more: (p={}) => <Icon size={p.size||18} d={<><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>}/>,
  back: (p={}) => <Icon size={p.size||18} d={<><path d="M19 12H5M12 19l-7-7 7-7"/></>}/>,
  logout: (p={}) => <Icon size={p.size||18} d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>}/>,
  calendar: (p={}) => <Icon size={p.size||18} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>}/>,
  key: (p={}) => <Icon size={p.size||18} d={<><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l2 2"/></>}/>,
  phone: (p={}) => <Icon size={p.size||18} d={<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></>}/>,
  wifi: (p={}) => <Icon size={p.size||18} d={<><path d="M5 12.55a11 11 0 0114 0M8.5 16.05a6 6 0 017 0M12 20h0"/><path d="M2 8.5a16 16 0 0120 0"/></>}/>,
  user: (p={}) => <Icon size={p.size||18} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></>}/>,
  shield: (p={}) => <Icon size={p.size||18} d={<><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></>}/>,
  check: (p={}) => <Icon size={p.size||18} d={<path d="M5 13l4 4L19 7"/>}/>,
  x: (p={}) => <Icon size={p.size||18} d={<path d="M6 6l12 12M6 18L18 6"/>}/>,
  upload: (p={}) => <Icon size={p.size||18} d={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></>}/>,
  eye: (p={}) => <Icon size={p.size||18} d={<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></>}/>,
};

window.I = I;
window.Icon = Icon;
