// Shared components
const { useState, useEffect, useRef, useMemo } = React;

function BrandMark({ size = 44 }) {
  return (
    <div className="brand">
      <img src="assets/logo.jpg" alt="Jessica's Pet Sitting" style={{ height: size }} />
    </div>);

}

function PetAvatar({ species, name, size = 30 }) {
  const cls = species === "Dog" ? "dog" : species === "Cat" ? "cat" : "other";
  const emoji = species === "Dog" ? "🐶" : species === "Cat" ? "🐱" : "🐾";
  return (
    <div className={"pet-avatar " + cls} style={{ width: size, height: size, fontSize: size * 0.45 }} title={name}>
      {name[0]}
    </div>);

}

function PetPhoto({ pet, large = false }) {
  // Stable placeholder color per pet
  const palettes = [
  ["#F4D6A3", "#E8A33D"],
  ["#D9C9E8", "#9F7BC8"],
  ["#C7DDC1", "#6B9B5E"],
  ["#F2C4C4", "#D97A7A"],
  ["#E8D4B8", "#B58A5C"]];

  const idx = (pet.name.charCodeAt(0) + pet.name.length) % palettes.length;
  const [light, dark] = palettes[idx];
  return (
    <div className="placeholder-pet" style={{
      background: `repeating-linear-gradient(135deg, ${light}, ${light} ${large ? 16 : 10}px, ${dark}22 ${large ? 16 : 10}px, ${dark}22 ${large ? 32 : 20}px)`,
      color: dark
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: large ? 64 : 36, lineHeight: 1, color: dark, fontFamily: "'Caveat', cursive", fontWeight: 700 }}>{pet.name}</div>
        <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: large ? 11 : 9, letterSpacing: "0.15em", color: dark, opacity: 0.75 }}>
          DROP PHOTO HERE
        </div>
      </div>
    </div>);

}

function Modal({ title, subtitle, children, onClose, footer, size }) {
  useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={"modal " + (size === "lg" ? "modal-lg" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="head">
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </div>
    </div>);

}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <I.check size={16} /> {message}
    </div>);

}

function TopNav({ user, currentRoute, onNav, onLogout, onProfile, onBell, bellRef, unreadCount = 0, pendingRequests = 0 }) {
  const isAdmin = user.role === "admin";
  return (
    <div className="topnav">
      <div className="brand" onClick={() => onNav(isAdmin ? "admin" : "home")} style={{ cursor: "pointer" }}>
        <img src="assets/logo.jpg" alt="Jessica's Pet Sitting" />
        <div className="brand-text">
          <span className="a">Jessica's</span>
          <span className="b">PET SITTING</span>
        </div>
      </div>

      {isAdmin ?
      <div className="nav-tabs">
          <button className={currentRoute === "admin" ? "active" : ""} onClick={() => onNav("admin")}>Homes</button>
          <button className={currentRoute === "requests" ? "active" : ""} onClick={() => onNav("requests")}>
            Requests {pendingRequests > 0 && <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px", borderRadius: 999, background: currentRoute === "requests" ? "rgba(255,255,255,0.25)" : "var(--heart)", color: "#fff", fontWeight: 700 }}>{pendingRequests}</span>}
          </button>
          <button className={currentRoute === "schedule" ? "active" : ""} onClick={() => onNav("schedule")}>Schedule</button>
          <button className={currentRoute === "invoices" ? "active" : ""} onClick={() => onNav("invoices")}>Invoices</button>
          <button className={currentRoute === "settings" ? "active" : ""} onClick={() => onNav("settings")}>Settings</button>
        </div> :

      <div className="nav-tabs">
          <button className={currentRoute === "home" ? "active" : ""} onClick={() => onNav("home")}>My Home</button>
          <button className={currentRoute === "settings-user" ? "active" : ""} onClick={() => onNav("settings-user")}>Settings</button>
        </div>
      }

      <div className="row" style={{ gap: 10 }}>
        <div className="bell-wrapper">
          <button ref={bellRef} className="icon-btn" title="Notifications" onClick={onBell}>
            <I.bell size={16} />
          </button>
          {unreadCount > 0 && <span className="bell-dot"/>}
        </div>
        <button className="user-chip" onClick={onProfile} style={{ cursor: "pointer" }}>
          <div className="avatar" style={{ background: isAdmin ? "var(--purple)" : "var(--green)" }}>{user.avatar}</div>
          <div className="meta">
            <span className="name">{user.name}</span>
            <span className="role">{isAdmin ? "Admin" : "Pet parent"}</span>
          </div>
        </button>
        <button className="icon-btn" title="Sign out" onClick={onLogout}><I.logout size={16} /></button>
      </div>
    </div>);

}

Object.assign(window, { BrandMark, PetAvatar, PetPhoto, Modal, Toast, TopNav });