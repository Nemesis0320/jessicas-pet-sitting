// Appointment scheduling — user requests + admin approval
const { useState: aUS } = React;

// Format a yyyy-mm-ddThh:mm string
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function fmtDateShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("en", { month: "short", day: "numeric" });
}
function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(1, Math.ceil(ms / 86400000));
}

const APPT_STATUS = {
  pending:   { label: "Pending review", color: "var(--amber)",      bg: "#FCEFD3", fg: "#7A5615" },
  approved:  { label: "Approved",       color: "var(--green)",      bg: "#E6F0E1", fg: "var(--green-deep)" },
  rejected:  { label: "Declined",       color: "var(--heart)",      bg: "#FBE0E0", fg: "#8B2929" },
  ongoing:   { label: "Sitting now",    color: "var(--brown)",      bg: "#EDDFCB", fg: "var(--brown-deep)" },
  completed: { label: "Completed",      color: "var(--ink-3)",      bg: "var(--bg-2)", fg: "var(--ink-2)" },
};

function ApptBadge({ status }) {
  const s = APPT_STATUS[status] || APPT_STATUS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 700,
      padding: "4px 10px",
      borderRadius: 999,
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }}/>
      {s.label}
    </span>
  );
}

// Modal for user to request a new appointment
function RequestApptModal({ home, onClose, onSubmit, editing }) {
  const today = new Date().toISOString().split("T")[0];
  const [start, setStart] = aUS(editing?.start || today + "T09:00");
  const [end, setEnd]     = aUS(editing?.end   || today + "T17:00");
  const [notes, setNotes] = aUS(editing?.notes || "");

  const valid = start && end && new Date(end) > new Date(start);
  const days = valid ? daysBetween(start, end) : 0;

  return (
    <Modal
      title={editing ? "Update sitting request" : "Request a sitting"}
      subtitle={`At ${home.name} — admin will approve before it's confirmed.`}
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit({ start, end, notes })} style={{ opacity: valid ? 1 : 0.5 }}>
          {editing ? "Update request" : "Submit request"}
        </button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Sitter arrives</label>
          <input className="input" type="datetime-local" value={start} onChange={e => setStart(e.target.value)}/>
        </div>
        <div className="field">
          <label>Sitter departs</label>
          <input className="input" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} min={start}/>
        </div>
      </div>
      {valid ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "#E6F0E1", color: "var(--green-deep)", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
          <I.calendar size={16}/> {days} {days === 1 ? "day" : "days"} of pet sitting · {fmtDateShort(start)} – {fmtDateShort(end)}
        </div>
      ) : (
        <div style={{ padding: 12, background: "#FBE0E0", color: "#8B2929", borderRadius: 10, fontSize: 13 }}>
          End must be after the start.
        </div>
      )}
      <div className="field">
        <label>Notes for the sitter <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional)</span></label>
        <textarea className="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Travel reason, anything special during this sitting, special instructions…"/>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
        <I.bell size={12}/> You'll get an email once the request is approved or if more info is needed.
      </div>
    </Modal>
  );
}

// Appointment list item (user view)
function ApptCard({ appt, onEdit, onCancel, canEdit }) {
  const s = APPT_STATUS[appt.status];
  return (
    <div style={{
      padding: 14,
      border: "1px solid var(--line)",
      borderRadius: 14,
      background: "var(--card)",
      borderLeft: `3px solid ${s.color}`,
      display: "flex",
      gap: 14,
      alignItems: "center",
    }}>
      <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, background: s.bg, color: s.fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", opacity: 0.85 }}>{new Date(appt.start).toLocaleString("en", { month: "short" }).toUpperCase()}</div>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{new Date(appt.start).getDate()}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {fmtDateShort(appt.start)} → {fmtDateShort(appt.end)}
          </div>
          <ApptBadge status={appt.status}/>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          {daysBetween(appt.start, appt.end)} days · arrives {new Date(appt.start).toLocaleString("en", { hour: "numeric", minute: "2-digit" })}, departs {new Date(appt.end).toLocaleString("en", { hour: "numeric", minute: "2-digit" })}
        </div>
        {appt.notes && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, fontStyle: "italic" }}>"{appt.notes}"</div>}
      </div>
      {canEdit && appt.status === "pending" && (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}><I.edit size={13}/></button>
          <button className="btn btn-danger btn-sm" onClick={onCancel}>Cancel</button>
        </div>
      )}
      {canEdit && appt.status === "approved" && (
        <button className="btn btn-outline btn-sm" onClick={onEdit}>Modify</button>
      )}
    </div>
  );
}

// Admin: appointment requests inbox
function AdminRequestsScreen({ appointments, homes, allUsers, allPets, onDecide, toast }) {
  const [filter, setFilter] = aUS("pending");
  const filtered = appointments.filter(a => filter === "all" ? true : a.status === filter)
    .sort((a, b) => new Date(b.createdAt || b.start) - new Date(a.createdAt || a.start));

  const home = (hid) => homes.find(h => h.id === hid);
  const user = (uid) => allUsers[uid];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">awaiting your call —</div>
          <h1>Appointment requests</h1>
          <div className="sub">Approve or decline pet-sitting requests from homeowners.</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18, padding: "14px 18px" }}>
        <div className="row" style={{ gap: 8 }}>
          {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Declined"], ["all", "All"]].map(([k, v]) => {
            const count = k === "all" ? appointments.length : appointments.filter(a => a.status === k).length;
            return (
              <button key={k} className={"btn btn-sm " + (filter === k ? "btn-primary" : "btn-ghost")} onClick={() => setFilter(k)}>
                {v} {count > 0 && <span style={{ marginLeft: 4, fontSize: 11, padding: "1px 7px", borderRadius: 999, background: filter === k ? "rgba(255,255,255,0.25)" : "var(--bg-2)" }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, color: "var(--ink-3)" }}>
            <I.calendar size={32}/>
            <div style={{ marginTop: 8, fontWeight: 600 }}>No {filter === "all" ? "" : filter} requests</div>
          </div>
        ) : filtered.map(a => {
          const h = home(a.homeId);
          const u = user(a.requestedBy);
          if (!h) return null;
          const pets = h.pets.map(pid => allPets[pid]).filter(Boolean);
          return (
            <div key={a.id} className="card card-pad" style={{ borderLeft: `4px solid ${APPT_STATUS[a.status].color}` }}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 14, background: APPT_STATUS[a.status].bg, color: APPT_STATUS[a.status].fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{new Date(a.start).toLocaleString("en", { month: "short" }).toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{new Date(a.start).getDate()}</div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25 }}>{h.name}</div>
                    <ApptBadge status={a.status}/>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 8 }}>
                    Requested by <strong style={{ color: "var(--ink-2)" }}>{u?.name || "—"}</strong> · {h.address}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 13 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.05em" }}>ARRIVES</div>
                      <div style={{ fontWeight: 600 }}>{fmtDate(a.start)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.05em" }}>DEPARTS</div>
                      <div style={{ fontWeight: 600 }}>{fmtDate(a.end)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.05em" }}>DURATION</div>
                      <div style={{ fontWeight: 600 }}>{daysBetween(a.start, a.end)} days · {pets.length} {pets.length === 1 ? "pet" : "pets"}</div>
                    </div>
                  </div>
                  {a.notes && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-2)", padding: 10, borderLeft: "3px solid var(--line-2)" }}>
                      "{a.notes}"
                    </div>
                  )}
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {pets.map(p => (
                      <span key={p.id} className="tag">{p.species === "Dog" ? "🐶" : p.species === "Cat" ? "🐱" : "🐾"} {p.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              {a.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <button className="btn btn-danger" onClick={() => { onDecide(a.id, "rejected"); toast("Request declined"); }}>
                    <I.x size={14}/> Decline
                  </button>
                  <button className="btn btn-green" onClick={() => { onDecide(a.id, "approved"); toast("Request approved · calendar updated"); }}>
                    <I.check size={14}/> Approve request
                  </button>
                </div>
              )}
              {a.status === "approved" && (
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--green-deep)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <I.check size={14}/> On the schedule. Synced to Google Calendar.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { RequestApptModal, ApptCard, ApptBadge, AdminRequestsScreen, APPT_STATUS, fmtDate, fmtDateShort, daysBetween });
