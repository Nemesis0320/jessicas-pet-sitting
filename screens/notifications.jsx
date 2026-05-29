// Notifications / Inbox — simulates the email system used throughout the app
// Each event represents an email that WOULD have been sent in production.

const { useState: nUS, useEffect: nUE, useRef: nUR } = React;

// Friendly icon + color per event kind
const NOTIF_KINDS = {
  request_submitted:  { icon: "calendar", color: "var(--brown)",      bg: "#FCEFD3" },
  request_approved:   { icon: "check",    color: "var(--green-deep)", bg: "#E6F0E1" },
  request_rejected:   { icon: "x",        color: "var(--heart)",      bg: "#FBE0E0" },
  invoice_sent:       { icon: "upload",   color: "var(--purple-deep)",bg: "#EDE3F7" },
  invoice_paid:       { icon: "check",    color: "var(--green-deep)", bg: "#E6F0E1" },
  incident_logged:    { icon: "bell",     color: "var(--heart)",      bg: "#FBE0E0" },
  note_posted:        { icon: "note",     color: "var(--ink-2)",      bg: "var(--bg-2)" },
  photo_uploaded:     { icon: "camera",   color: "var(--brown)",      bg: "#FCEFD3" },
  account_created:    { icon: "user",     color: "var(--brown)",      bg: "#FCEFD3" },
  password_reset:     { icon: "key",      color: "var(--amber)",      bg: "#FCEFD3" },
};

function relTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)        return "just now";
  if (diff < 3600)      return Math.floor(diff / 60) + "m ago";
  if (diff < 86400)     return Math.floor(diff / 3600) + "h ago";
  if (diff < 7 * 86400) return Math.floor(diff / 86400) + "d ago";
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

// Drop-down popover triggered by the bell button.
// Anchors to the top-right; closes on outside click or escape.
function InboxPopover({ items, anchorRef, onClose, onMarkAllRead, onOpenAll, onOpenItem }) {
  const popRef = nUR(null);

  nUE(() => {
    const onDown = (e) => {
      if (!popRef.current) return;
      if (popRef.current.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  const unread = items.filter(i => !i.read).length;
  const recent = items.slice(0, 6);

  return (
    <div ref={popRef} className="inbox-popover" role="dialog" aria-label="Notifications">
      <div className="inbox-popover-head">
        <strong>Notifications</strong>
        {unread > 0 && <span className="inbox-unread-badge">{unread} new</span>}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onMarkAllRead}>
          <I.check size={12}/> Mark all read
        </button>
      </div>
      {recent.length === 0 ? (
        <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)" }}>
          <I.bell size={28}/>
          <div style={{ fontWeight: 600, color: "var(--ink-2)", marginTop: 8 }}>You're all caught up</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Sitting updates, invoices, and incident reports will appear here.</div>
        </div>
      ) : (
        <div className="inbox-popover-list">
          {recent.map(n => <NotifRow key={n.id} n={n} onClick={() => { onOpenItem(n); onClose(); }} compact/>)}
        </div>
      )}
      <div className="inbox-popover-foot">
        <button className="btn btn-ghost btn-sm btn-block" onClick={() => { onOpenAll(); onClose(); }}>
          See all {items.length > 0 && `(${items.length})`} →
        </button>
      </div>
    </div>
  );
}

function NotifRow({ n, onClick, compact }) {
  const kind = NOTIF_KINDS[n.kind] || NOTIF_KINDS.note_posted;
  const Glyph = I[kind.icon] || I.bell;
  return (
    <button
      className={"inbox-row " + (n.read ? "" : "inbox-row-unread") + (compact ? " inbox-row-compact" : "")}
      onClick={onClick}
    >
      <div className="inbox-row-icon" style={{ background: kind.bg, color: kind.color }}>
        <Glyph size={compact ? 14 : 16}/>
      </div>
      <div className="inbox-row-body">
        <div className="inbox-row-title">{n.title}</div>
        {n.summary && <div className="inbox-row-summary">{n.summary}</div>}
        <div className="inbox-row-meta">
          <span>{relTime(n.createdAt)}</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>EMAIL</span>
        </div>
      </div>
      {!n.read && <span className="inbox-row-dot"/>}
    </button>
  );
}

// Full-page list of every notification + email-style detail view
function NotificationsPage({ items, onBack, onMarkAllRead, onMarkRead, user }) {
  const [open, setOpen] = nUS(null);
  const unread = items.filter(i => !i.read).length;

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.back size={14}/> Back</button>
      </div>
      <div className="page-head">
        <div>
          <div className="hello">your inbox —</div>
          <h1>Notifications</h1>
          <div className="sub">All updates we've sent to <strong style={{ color: "var(--ink)" }}>{user?.email || "you"}</strong>.</div>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={onMarkAllRead}><I.check size={14}/> Mark all read</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
          <I.bell size={32}/>
          <div style={{ marginTop: 10, fontWeight: 700, color: "var(--ink-2)" }}>No notifications yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>You'll get an email — and see it here — for sitting status changes, incidents, invoices, and more.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(n => (
            <NotifRow key={n.id} n={n} onClick={() => { setOpen(n); if (!n.read) onMarkRead(n.id); }}/>
          ))}
        </div>
      )}

      {open && <EmailDetailModal email={open} onClose={() => setOpen(null)}/>}
    </div>
  );
}

// "View as email" — opens the notification as a faux email
function EmailDetailModal({ email, onClose }) {
  return (
    <Modal
      size="lg"
      title="Email preview"
      subtitle={`Sent ${new Date(email.createdAt).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
      onClose={onClose}
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}
    >
      <div className="email-letterhead">
        <div className="email-from">
          <div className="email-from-avatar">JS</div>
          <div>
            <div style={{ fontWeight: 700 }}>Jessica's Pet Sitting <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>&lt;noreply@jessicaspetsitting.com&gt;</span></div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>To: {email.to || "you"}</div>
          </div>
        </div>
        <h2 style={{ margin: "16px 0 4px", fontSize: 20 }}>{email.title}</h2>
        {email.summary && <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 14 }}>{email.summary}</div>}

        {email.body && (
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-wrap", padding: "14px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {email.body}
          </div>
        )}

        {email.fields && email.fields.length > 0 && (
          <div style={{ margin: "14px 0", padding: 14, background: "var(--bg-2)", borderRadius: 10 }}>
            {email.fields.map((f, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "4px 14px", fontSize: 13, padding: "3px 0" }}>
                <div style={{ color: "var(--ink-3)" }}>{f.label}</div>
                <div style={{ fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>
        )}

        {email.cta && (
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <button className="btn btn-primary" onClick={onClose}>{email.cta}</button>
          </div>
        )}

        <div style={{ marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>
          You're receiving this because you have an account at Jessica's Pet Sitting.<br/>
          Manage email preferences in <strong>Settings → Notifications</strong>.
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { InboxPopover, NotificationsPage, NOTIF_KINDS });
