// Admin screen — all homes, schedule, settings
function AdminScreen({ user, route, homes, allPets, allUsers, appointments, invoices, pricing, tweaks, setTweak, onOpenHome, onOpenPet, onNav, onInviteHomeowner, onDecideAppt, onUpdateInvoice, onCreateInvoice, onUpdatePricing, toast }) {
  // Hooks MUST be declared before any conditional return.
  const [showExport, setShowExport] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  if (route === "schedule") return <AdminSchedule homes={homes} appointments={appointments} allUsers={allUsers} onOpenHome={onOpenHome}/>;
  if (route === "requests") return <AdminRequestsScreen appointments={appointments} homes={homes} allUsers={allUsers} allPets={allPets} onDecide={onDecideAppt} toast={toast}/>;
  if (route === "settings") return <AdminSettings toast={toast} tweaks={tweaks} setTweak={setTweak}/>;
  if (route === "invoices") {
    window.__pricingUpdate = onUpdatePricing;
    return <AdminInvoices invoices={invoices} pricing={pricing} homes={homes} appointments={appointments} onUpdate={onUpdateInvoice} onCreate={onCreateInvoice} toast={toast}/>;
  }
  if (route === "adminPets") return <AdminAllPets homes={homes} allPets={allPets} onOpenPet={onOpenPet} onBack={() => onNav("admin")}/>;
  if (route === "adminActive") return <AdminActiveSittings appointments={appointments} homes={homes} allUsers={allUsers} allPets={allPets} onOpenHome={onOpenHome} onBack={() => onNav("admin")}/>;

  const filtered = homes.filter(h => {
    if (filter !== "all" && h.status !== filter) return false;
    if (query && !(h.name.toLowerCase().includes(query.toLowerCase()) || h.address.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const totalPets = homes.reduce((n, h) => n + h.pets.length, 0);
  const pendingCount = (appointments || []).filter(a => a.status === "pending").length;
  const activeCount = (appointments || []).filter(a => a.status === "approved" || a.status === "ongoing").length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">overview —</div>
          <h1>All homes</h1>
          <div className="sub">{homes.length} households, {totalPets} pets currently in your care network.</div>
        </div>
        <div className="row">
          <button className="btn btn-outline" onClick={() => setShowExport(true)}><I.upload size={14}/> Export</button>
          <button className="btn btn-purple" onClick={onInviteHomeowner}><I.plus size={14}/> Invite homeowner</button>
        </div>
      </div>

      {showExport && (
        <ExportDataModal
          homes={homes}
          allPets={allPets}
          allUsers={allUsers}
          appointments={appointments}
          invoices={invoices}
          onClose={() => setShowExport(false)}
          toast={toast}
        />
      )}

      <div className="stats">
        <div className="stat stat-clickable" onClick={() => { /* already here */ window.scrollTo({ top: document.querySelector(".section-homes")?.offsetTop || 0, behavior: "smooth" }); }}>
          <div className="icon" style={{ background: "#EDE3F7", color: "var(--purple-deep)" }}><I.home size={20}/></div>
          <div><div className="num">{homes.length}</div><div className="lbl">Total homes</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => onNav("adminPets")}>
          <div className="icon" style={{ background: "#E6F0E1", color: "var(--green-deep)" }}><I.paw size={20}/></div>
          <div><div className="num">{totalPets}</div><div className="lbl">Pets across homes</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => onNav("adminActive")}>
          <div className="icon" style={{ background: "#FCEFD3", color: "#7A5615" }}><I.calendar size={20}/></div>
          <div><div className="num">{activeCount}</div><div className="lbl">Active sittings</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => onNav("requests")} style={pendingCount > 0 ? { borderColor: "#E8D9A8" } : null}>
          <div className="icon" style={{ background: "#FBE0E0", color: "#8B2929" }}><I.bell size={20}/></div>
          <div><div className="num">{pendingCount}</div><div className="lbl">Pending requests</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-pad" style={{ marginBottom: 18, padding: "14px 18px" }}>
        <div className="between" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            {[["all", "All"], ["active", "Active"], ["upcoming", "Upcoming"], ["onboarding", "Onboarding"]].map(([k, v]) => (
              <button key={k} className={"btn btn-sm " + (filter === k ? "btn-primary" : "btn-ghost")} onClick={() => setFilter(k)}>{v}</button>
            ))}
          </div>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search homes or addresses…" style={{ paddingLeft: 38 }}/>
            <div style={{ position: "absolute", left: 12, top: 14, color: "var(--ink-3)" }}><I.search size={16}/></div>
          </div>
        </div>
      </div>

      {/* Home list */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 0.6fr", gap: 14, padding: "0 18px 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.08em" }}>
          <div>HOME</div>
          <div>PETS</div>
          <div>DATES</div>
          <div>STATUS</div>
          <div></div>
        </div>
        {filtered.map(h => {
          const pets = h.pets.map(pid => allPets[pid]).filter(Boolean);
          const primary = (h.residents || []).map(uid => allUsers?.[uid]).find(u => u && u.isPrimary) || (h.residents || []).map(uid => allUsers?.[uid]).find(Boolean);
          const ownerName = primary?.name || "—";
          // Find earliest upcoming appt
          const upcoming = (appointments || [])
            .filter(a => a.homeId === h.id && (a.status === "approved" || a.status === "pending" || a.status === "ongoing"))
            .sort((a, b) => new Date(a.start) - new Date(b.start))[0];
          const dateLabel = upcoming
            ? `${window.fmtDateShort(upcoming.start)} – ${window.fmtDateShort(upcoming.end)}`
            : "—";
          return (
            <div key={h.id} className="home-row" onClick={() => onOpenHome(h.id)}>
              <div className="h-name">
                <div className="icon">{ownerName.split(" ").map(w => w[0]).join("").slice(0,2)}</div>
                <div>
                  <div className="name">{h.name}</div>
                  <div className="addr">{h.address}</div>
                </div>
              </div>
              <div className="pets-mini">
                {pets.slice(0, 4).map((p) => (
                  <PetAvatar key={p.id} species={p.species} name={p.name}/>
                ))}
                {pets.length > 4 && <span className="pet-avatar">+{pets.length - 4}</span>}
                {pets.length === 0 && <span style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>No pets yet</span>}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                {dateLabel}
                {upcoming && upcoming.status === "pending" && (
                  <div style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700, marginTop: 2 }}>Awaiting approval</div>
                )}
              </div>
              <div>
                <span className={"status-dot " + (h.status === "active" ? "" : h.status === "onboarding" ? "urgent" : "idle")}>
                  {h.status === "active" ? "Sitting now" : h.status === "onboarding" ? "Onboarding" : "Upcoming"}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpenHome(h.id); }}>Open →</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}>No homes match your filters.</div>
        )}
      </div>
    </div>
  );
}

function AdminSchedule({ homes, appointments, allUsers, onOpenHome }) {
  const [showExport, setShowExport] = useState(false);
  // 14-day strip from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const monthDay = d => d.toLocaleDateString("en", { weekday: "short", day: "numeric" });

  const colorFor = (status) => ({
    approved:  "var(--green)",
    ongoing:   "var(--brown)",
    pending:   "var(--amber)",
    rejected:  "var(--heart)",
    completed: "var(--ink-3)",
  }[status] || "var(--ink-3)");

  // Derive bookings from appointments
  const bookings = (appointments || [])
    .filter(a => a.status !== "rejected" && a.status !== "completed")
    .map(a => {
      const start = new Date(a.start); start.setHours(0,0,0,0);
      const end   = new Date(a.end);   end.setHours(0,0,0,0);
      const s = Math.floor((start - today) / 86400000);
      const e = Math.floor((end - today) / 86400000);
      if (e < 0 || s > 13) return null;
      return {
        appt: a,
        home: homes.find(h => h.id === a.homeId),
        start: Math.max(0, s),
        end: Math.min(13, e),
        color: colorFor(a.status),
        status: a.status,
      };
    })
    .filter(Boolean);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">two weeks out —</div>
          <h1>Schedule</h1>
          <div className="sub">Color-coded by status. Click any block to open the home.</div>
        </div>
        <div className="row">
          <button className="btn btn-outline btn-sm">‹ Prev</button>
          <button className="btn btn-outline btn-sm">Next ›</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowExport(true)}>
            <GoogleCalIcon size={14}/> &nbsp;Sync with Google Calendar
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="row" style={{ gap: 16, marginBottom: 14, fontSize: 12, color: "var(--ink-3)", paddingLeft: 4 }}>
        {[["approved","Approved"],["pending","Pending"],["ongoing","Ongoing"]].map(([k,l]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: colorFor(k) }}/> {l}
          </span>
        ))}
      </div>

      <div className="card card-pad">
        <div style={{ display: "grid", gridTemplateColumns: `220px repeat(14, 1fr)`, gap: 4, fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>
          <div></div>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: "center", padding: "4px 0" }}>{monthDay(d)}</div>
          ))}
        </div>
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: "var(--ink-3)" }}>No bookings in the next 14 days.</div>
        ) : bookings.map((b, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: `220px repeat(14, 1fr)`, gap: 4, alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, paddingRight: 10, cursor: "pointer" }} onClick={() => onOpenHome(b.home.id)}>
              <div>{b.home?.name || "—"}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>{b.home?.pets.length || 0} pet{b.home?.pets.length !== 1 ? "s" : ""} · <span style={{ color: b.color, fontWeight: 700, textTransform: "capitalize" }}>{b.status}</span></div>
            </div>
            {days.map((_, i) => {
              const active = i >= b.start && i <= b.end;
              const isStart = i === b.start;
              const isEnd = i === b.end;
              return (
                <div key={i} style={{
                  height: 34,
                  background: active ? b.color : "var(--bg-2)",
                  borderRadius: active ? (isStart && isEnd ? 8 : isStart ? "8px 2px 2px 8px" : isEnd ? "2px 8px 8px 2px" : 2) : 2,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: active ? "pointer" : "default",
                  opacity: active && b.status === "pending" ? 0.7 : 1,
                  border: active && b.status === "pending" ? "1.5px dashed #fff" : "none",
                }} onClick={() => active && onOpenHome(b.home.id)}>
                  {isStart && "▶"}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showExport && <CalendarExportModal appointments={appointments} homes={homes} onClose={() => setShowExport(false)}/>}

      {/* Full future appointments list */}
      <ScheduleFutureList appointments={appointments} homes={homes} allUsers={allUsers} onOpenHome={onOpenHome}/>
    </div>
  );
}

// Lists all approved/pending/ongoing appointments below the 14-day strip
function ScheduleFutureList({ appointments, homes, allUsers, onOpenHome }) {
  const now = new Date();
  const future = (appointments || [])
    .filter(a => (a.status === "approved" || a.status === "pending" || a.status === "ongoing") && new Date(a.end) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (future.length === 0) {
    return (
      <div className="section">
        <h2>All upcoming sittings <span className="count">0</span></h2>
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
          <I.calendar size={32}/>
          <div style={{ marginTop: 8, fontWeight: 600 }}>No upcoming sittings on the books</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Approved and pending requests show up here.</div>
        </div>
      </div>
    );
  }

  // Group by month for readability
  const groups = {};
  future.forEach(a => {
    const d = new Date(a.start);
    const key = d.toLocaleString("en", { month: "long", year: "numeric" });
    (groups[key] = groups[key] || []).push(a);
  });

  return (
    <div className="section">
      <h2>All upcoming sittings <span className="count">{future.length}</span></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {Object.entries(groups).map(([month, list]) => (
          <div key={month}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-3)", margin: "0 4px 8px", textTransform: "uppercase" }}>{month}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map(a => {
                const home = homes.find(h => h.id === a.homeId);
                const primary = (home?.residents || []).map(uid => allUsers?.[uid]).find(u => u && u.isPrimary);
                const s = window.APPT_STATUS[a.status];
                return (
                  <div key={a.id} className="card card-pad" style={{ borderLeft: `4px solid ${s.color}`, cursor: "pointer" }} onClick={() => onOpenHome(a.homeId)}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 12, background: s.bg, color: s.fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>{new Date(a.start).toLocaleString("en", { month: "short" }).toUpperCase()}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{new Date(a.start).getDate()}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row" style={{ gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{home?.name}</div>
                          <ApptBadge status={a.status}/>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{primary?.name || "—"} · {home?.address}</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                          {window.fmtDate(a.start)} → {window.fmtDate(a.end)} · {window.daysBetween(a.start, a.end)} days
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpenHome(a.homeId); }}>Open →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettings({ toast, tweaks, setTweak }) {
  const [section, setSection] = useState("business");
  const [acceptNew, setAcceptNew] = useState(true);
  const [vaccReq, setVaccReq] = useState(true);
  const [autoNotes, setAutoNotes] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [requestEmails, setRequestEmails] = useState(true);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalAccount, setGcalAccount] = useState("jessica@jessicaspetsitting.com");
  const [gcalAutoSync, setGcalAutoSync] = useState(true);
  const [gcalReminders, setGcalReminders] = useState(true);

  const [team, setTeam] = useState([
    { id: "u1", name: "Jessica Samp",  role: "Owner · Admin",   email: "jessica@jessicaspetsitting.com", color: "var(--purple)" },
    { id: "u2", name: "Connor",         role: "Admin",            email: "connor@jessicaspetsitting.com",  color: "var(--green)" },
  ]);
  const [editing, setEditing] = useState(null); // member object or null
  const [adding, setAdding] = useState(false);

  const Switch = ({ value, onChange }) => (
    <button className={"switch " + (value ? "on" : "")} onClick={() => { onChange(!value); toast("Setting updated"); }}/>
  );

  const initials = n => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const sections = {
    appearance: <AppearancePanel tweaks={tweaks} setTweak={setTweak}/>,
    business: (
      <div>
        <h2 style={{ marginTop: 0 }}>Business profile</h2>        <div className="field" style={{ marginBottom: 14 }}><label>Business name</label><input className="input" defaultValue="Jessica's Pet Sitting"/></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div className="field"><label>Owner</label><input className="input" defaultValue="Jessica Samp"/></div>
          <div className="field"><label>Phone</label><input className="input" defaultValue="(847) 855-0100"/></div>
        </div>
        <div className="field" style={{ marginBottom: 14 }}><label>Service area</label><input className="input" defaultValue="Gurnee, IL and surrounding Lake County (30 mi)"/></div>
        <div className="field"><label>Bio</label><textarea className="textarea" rows={4} defaultValue="Insured & bonded pet care since 2018. Specializing in long-term in-home sittings, medication-savvy with seniors, and shy/anxious pets."/></div>
      </div>
    ),
    booking: (
      <div>
        <h2 style={{ marginTop: 0 }}>Booking & policies</h2>
        <div className="settings-row">
          <div><div className="label">Accept new homes</div><div className="desc">When off, the public booking form hides.</div></div>
          <Switch value={acceptNew} onChange={setAcceptNew}/>
        </div>
        <div className="settings-row">
          <div><div className="label">Vaccination records required</div><div className="desc">Owners must upload current records before booking.</div></div>
          <Switch value={vaccReq} onChange={setVaccReq}/>
        </div>
        <div className="settings-row">
          <div><div className="label">Auto-prompt daily sitter notes</div><div className="desc">Reminds the sitter to log notes at 8pm each day.</div></div>
          <Switch value={autoNotes} onChange={setAutoNotes}/>
        </div>
        <div className="settings-row">
          <div><div className="label">Minimum booking notice</div><div className="desc">Earliest a new home can request a sitting.</div></div>
          <select className="select" style={{ width: 160 }} defaultValue="3">
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">1 week</option>
            <option value="14">2 weeks</option>
          </select>
        </div>
      </div>
    ),
    calendar: (
      <div>
        <h2 style={{ marginTop: 0 }}>Calendar sync</h2>
        <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 16 }}>
          Push bookings to Google Calendar so the whole team sees the schedule in one place.
        </div>

        {!gcalConnected ? (
          <div style={{ padding: 22, border: "1.5px dashed var(--line-2)", borderRadius: 14, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 12px", borderRadius: 14, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GoogleCalIcon size={28}/>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Connect Google Calendar</div>
            <div style={{ color: "var(--ink-3)", fontSize: 13, margin: "4px 0 14px" }}>
              Bookings will appear in a dedicated "Jessica's Pet Sitting" calendar.
            </div>
            <button className="btn btn-primary" onClick={() => { setGcalConnected(true); toast("Google Calendar connected"); }}>
              <GoogleCalIcon size={14}/> Connect Google account
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, background: "var(--bg-2)", borderRadius: 12, marginBottom: 18 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GoogleCalIcon size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Connected to Google Calendar</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{gcalAccount}</div>
              </div>
              <span className="status-dot">Synced 2 min ago</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setGcalConnected(false); toast("Disconnected"); }}>Disconnect</button>
            </div>

            <div className="settings-row">
              <div><div className="label">Auto-sync new bookings</div><div className="desc">New sittings push to Google Calendar instantly.</div></div>
              <Switch value={gcalAutoSync} onChange={setGcalAutoSync}/>
            </div>
            <div className="settings-row">
              <div><div className="label">Reminders</div><div className="desc">Add a 1-day-before reminder to every event.</div></div>
              <Switch value={gcalReminders} onChange={setGcalReminders}/>
            </div>
            <div className="settings-row">
              <div><div className="label">Target calendar</div><div className="desc">Which calendar receives events.</div></div>
              <select className="select" style={{ width: 220 }} defaultValue="petsitting">
                <option value="primary">Primary calendar</option>
                <option value="petsitting">Jessica's Pet Sitting</option>
                <option value="new">+ Create new calendar…</option>
              </select>
            </div>

            <div style={{ marginTop: 18, padding: 14, background: "var(--bg-2)", borderRadius: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Export options</div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-outline btn-sm" onClick={() => toast("ICS file downloaded")}><I.upload size={14}/> Download .ics file</button>
                <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard && navigator.clipboard.writeText("https://jessicaspetsitting.com/cal/feed.ics"); toast("Subscribe link copied"); }}><I.calendar size={14}/> Copy subscribe link</button>
                <button className="btn btn-outline btn-sm" onClick={() => toast("Sync triggered")}>Sync now</button>
              </div>
            </div>
          </>
        )}
      </div>
    ),
    notifications: (
      <div>
        <h2 style={{ marginTop: 0 }}>Email notifications</h2>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>This app is email-first. SMS is not supported.</div>
        <div className="settings-row">
          <div><div className="label">New sitting requests</div><div className="desc">Get an email with full details every time a homeowner submits a request.</div></div>
          <Switch value={requestEmails} onChange={setRequestEmails}/>
        </div>
        <div className="settings-row">
          <div><div className="label">Emergency alerts</div><div className="desc">High-priority email when a pet's status changes to "urgent".</div></div>
          <Switch value={emergencyAlerts} onChange={setEmergencyAlerts}/>
        </div>
        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-2)" }}>
          <strong>Always sent:</strong> Incident reports · Password reset requests · Account deletion confirmations.
        </div>
      </div>
    ),
    team: (
      <div>
        <div className="between" style={{ marginBottom: 6 }}>
          <h2 style={{ margin: 0 }}>Team members</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><I.plus size={14}/> Add member</button>
        </div>
        <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 14 }}>Admins can see all homes, modify settings, and post on behalf of sitters.</div>
        {team.map(m => (
          <div key={m.id} className="settings-row">
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{initials(m.name)}</div>
              <div>
                <div className="label">{m.name}</div>
                <div className="desc">{m.role} · {m.email}</div>
              </div>
            </div>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(m)}><I.edit size={14}/></button>
              {m.role !== "Owner · Admin" && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setTeam(t => t.filter(x => x.id !== m.id)); toast("Team member removed"); }}><I.trash size={14}/></button>
              )}
            </div>
          </div>
        ))}

        {(editing || adding) && (
          <TeamMemberModal
            member={editing}
            onClose={() => { setEditing(null); setAdding(false); }}
            onResetPassword={editing ? () => { toast(`Password reset link sent to ${editing.name}`); setEditing(null); } : null}
            onSave={(m) => {
              if (editing) {
                setTeam(prev => prev.map(x => x.id === editing.id ? { ...editing, ...m } : x));
                toast("Member updated");
              } else {
                setTeam(prev => [...prev, { id: "u" + Date.now(), ...m, color: ["var(--purple)","var(--green)","var(--amber)","var(--brown)"][prev.length % 4] }]);
                toast("Member added");
              }
              setEditing(null); setAdding(false);
            }}
          />
        )}
      </div>
    ),
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">control panel —</div>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-nav">
          <button className={section === "appearance" ? "active" : ""} onClick={() => setSection("appearance")}>Appearance</button>
          <button className={section === "business" ? "active" : ""} onClick={() => setSection("business")}>Business profile</button>
          <button className={section === "booking" ? "active" : ""} onClick={() => setSection("booking")}>Booking & policies</button>
          <button className={section === "calendar" ? "active" : ""} onClick={() => setSection("calendar")}>Calendar sync</button>
          <button className={section === "notifications" ? "active" : ""} onClick={() => setSection("notifications")}>Notifications</button>
          <button className={section === "team" ? "active" : ""} onClick={() => setSection("team")}>Team members</button>
        </div>
        <div className="card card-pad">
          {sections[section]}
        </div>
      </div>
    </div>
  );
}

// Admin home detail view — shows pets in a particular home (admin perspective)
function AdminHomeDetail({ home, pets, allUsers, appointments, allPets, onboardingProgress, onToggleOnboarding, onCompleteOnboarding, onBack, onOpenPet, onEditHome, onAddPet, onResetPassword, onDeleteHome, pendingResets }) {
  const isPending = pendingResets && pendingResets.has(home.id);
  const residents = (home.residents || []).map(uid => allUsers?.[uid]).filter(Boolean);
  const primary = residents.find(r => r.isPrimary) || residents[0];
  const ownerName = primary?.name || "—";
  const [deleteStep, setDeleteStep] = useState(0); // 0 = idle, 1 = confirm, 2 = type-to-confirm
  const [confirmText, setConfirmText] = useState("");
  const upcomingAppts = (appointments || [])
    .filter(a => a.homeId === home.id && a.status !== "completed" && a.status !== "rejected")
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const expectedText = "REMOVE " + (home.name || "HOME").toUpperCase().slice(0, 24);

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.back size={14}/> Back to all homes</button>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={onEditHome}><I.edit size={14}/> Edit home</button>
          <button className="btn btn-outline btn-sm" onClick={onResetPassword} disabled={isPending} style={{ opacity: isPending ? 0.6 : 1 }}>
            <I.key size={14}/> {isPending ? "Reset pending" : "Reset password"}
          </button>
          {onDeleteHome && (
            <button className="btn btn-danger btn-sm" onClick={() => setDeleteStep(1)}>
              <I.trash size={14}/> Remove home
            </button>
          )}
        </div>
      </div>

      {deleteStep > 0 && (
        <div className="alert" style={{ marginBottom: 18, background: "#FBE0E0", color: "#6B1F1F", border: "1px solid #F2C7C7", flexDirection: "column", alignItems: "stretch", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div className="dot"/>
            <div>
              <strong>Permanently remove {home.name}?</strong>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                This deletes the home, all {pets.length} pet{pets.length === 1 ? "" : "s"} and their records (photos, notes, vaccinations, incidents), all household member accounts, and any appointments or invoices tied to this home.
              </div>
            </div>
          </div>
          {deleteStep === 1 ? (
            <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteStep(0)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteStep(2)}>I understand — continue</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13 }}>To confirm, type <strong className="mono">{expectedText}</strong> below.</div>
              <input className="input mono" autoFocus value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={expectedText} style={{ letterSpacing: "0.05em" }}/>
              <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setDeleteStep(0); setConfirmText(""); }}>Cancel</button>
                <button className="btn btn-danger btn-sm" disabled={confirmText !== expectedText} onClick={() => { onDeleteHome(home.id); }} style={{ opacity: confirmText === expectedText ? 1 : 0.5 }}>
                  Permanently remove home
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="page-head">
        <div>
          <div className="hello">{ownerName} —</div>
          <h1>{home.name}</h1>
          <div className="sub">{home.address}</div>
        </div>
        <span className={"tag " + (home.status === "active" ? "green" : home.status === "onboarding" ? "amber" : "purple")} style={{ fontSize: 13, padding: "6px 14px" }}>
          {home.status === "active" ? "Sitting now" : home.status === "onboarding" ? "Onboarding" : "Upcoming"}
        </span>
      </div>

      {isPending && (
        <div className="alert" style={{ marginBottom: 18, background: "#FCEFD3", color: "#7A5615", border: "1px solid #E8D9A8" }}>
          <div className="dot" style={{ background: "#E8A33D" }}/>
          <div><strong>Password reset is pending.</strong> {ownerName} will be prompted to set a new password the next time they sign in.</div>
        </div>
      )}

      {home.status === "onboarding" && (
        <div style={{ marginBottom: 18 }}>
          <OnboardingChecklist
            home={home}
            allPets={allPets}
            allUsers={allUsers}
            progress={onboardingProgress || {}}
            onToggle={onToggleOnboarding}
            onComplete={onCompleteOnboarding}
          />
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>HOUSEHOLD</div>
            {residents.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-3)", fontStyle: "italic", marginTop: 4 }}>No residents yet</div>}
            {residents.map(r => (
              <div key={r.id} style={{ marginTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name} {r.isPrimary && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green-deep)", background: "#E6F0E1", padding: "1px 6px", borderRadius: 999 }}>PRIMARY</span>}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.email}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>{(home.accessKind || "ACCESS").toUpperCase()}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{home.accessDetail || <em style={{ color: "var(--ink-3)" }}>not set</em>}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>WIFI</div>
            <div style={{ fontSize: 13, marginTop: 4 }} className="mono">{home.wifiNetwork || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">{home.wifiPassword || ""}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>EMERGENCY VET</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{home.emergencyVet || <em style={{ color: "var(--ink-3)" }}>not set</em>}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{home.emergencyPhone}</div>
          </div>
        </div>
        {home.notes && (
          <div style={{ marginTop: 18, padding: 14, background: "var(--bg-2)", borderRadius: 12, fontSize: 13, color: "var(--ink-2)" }}>
            <strong>House notes:</strong> {home.notes}
          </div>
        )}
      </div>

      {/* Appointments at this home */}
      {upcomingAppts.length > 0 && (
        <div className="section" style={{ marginTop: 0 }}>
          <h2>Scheduled sittings <span className="count">{upcomingAppts.length}</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingAppts.map(a => <ApptCard key={a.id} appt={a} canEdit={false}/>)}
          </div>
        </div>
      )}

      <div className="section">
        <h2>Pets in this home <span className="count">{pets.length}</span></h2>
        <div className="pet-grid">
          {pets.map(p => {
            const age = window.computeAge(p.birthday);
            return (
              <div key={p.id} className="pet-card" onClick={() => onOpenPet(p.id)}>
                <div className="photo">
                  <PetPhoto pet={p}/>
                  <span className="badge-tl">{p.species}</span>
                  {p.meds?.length > 0 && (<span className="badge-tr"><I.pill size={11}/> {p.meds.length}</span>)}
                </div>
                <div className="body">
                  <div className="between">
                    <div className="name">{p.name}</div>
                    <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{age || "—"}</div>
                  </div>
                  <div className="meta">{p.breed} · {p.sex} · {p.weight ? `${p.weight} ${p.weightUnit || "lb"}` : "—"}</div>
                  <div className="tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                </div>
              </div>
            );
          })}
          {onAddPet && (
            <button className="add-pet" onClick={onAddPet}>
              <div className="plus"><I.plus size={20}/></div>
              <div>Add a pet</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>On behalf of {(primary?.name || "owner").split(" ")[0]}</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen, AdminHomeDetail });

// All Pets management view
function AdminAllPets({ homes, allPets, onOpenPet, onBack }) {
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState("All");

  const flat = homes.flatMap(h => (h.pets || []).map(pid => ({ pet: allPets[pid], home: h })).filter(x => x.pet));
  const filtered = flat.filter(({ pet, home }) => {
    if (species !== "All" && pet.species !== species) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return pet.name.toLowerCase().includes(q) || pet.breed?.toLowerCase().includes(q) || home.name.toLowerCase().includes(q);
  });

  const speciesList = ["All", ...new Set(flat.map(x => x.pet.species))];

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.back size={14}/> Back to homes</button>
      </div>
      <div className="page-head">
        <div>
          <div className="hello">across all homes —</div>
          <h1>All pets</h1>
          <div className="sub">{flat.length} pets in {homes.length} homes.</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18, padding: "14px 18px" }}>
        <div className="between" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            {speciesList.map(s => (
              <button key={s} className={"btn btn-sm " + (species === s ? "btn-primary" : "btn-ghost")} onClick={() => setSpecies(s)}>{s}</button>
            ))}
          </div>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pet, breed, home…" style={{ paddingLeft: 38 }}/>
            <div style={{ position: "absolute", left: 12, top: 14, color: "var(--ink-3)" }}><I.search size={16}/></div>
          </div>
        </div>
      </div>

      <div className="pet-grid">
        {filtered.map(({ pet, home }) => {
          const age = window.computeAge(pet.birthday);
          return (
            <div key={pet.id} className="pet-card" onClick={() => onOpenPet(pet.id)}>
              <div className="photo">
                <PetPhoto pet={pet}/>
                <span className="badge-tl">{pet.species}</span>
                {pet.meds?.length > 0 && (<span className="badge-tr"><I.pill size={11}/> {pet.meds.length}</span>)}
              </div>
              <div className="body">
                <div className="between">
                  <div className="name">{pet.name}</div>
                  <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{age || "—"}</div>
                </div>
                <div className="meta">{pet.breed} · {pet.sex} · {pet.weight ? `${pet.weight} ${pet.weightUnit || "lb"}` : "—"}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <I.home size={11}/> {home.name}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--ink-3)" }}>No pets match.</div>
        )}
      </div>
    </div>
  );
}

// Active Sittings — filtered appointment list for admins
function AdminActiveSittings({ appointments, homes, allUsers, allPets, onOpenHome, onBack }) {
  const active = appointments
    .filter(a => a.status === "approved" || a.status === "ongoing")
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.back size={14}/> Back to homes</button>
      </div>
      <div className="page-head">
        <div>
          <div className="hello">currently on the books —</div>
          <h1>Active sittings</h1>
          <div className="sub">{active.length} approved or ongoing booking{active.length === 1 ? "" : "s"}.</div>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)", padding: 50 }}>
          <I.calendar size={32}/>
          <div style={{ marginTop: 8, fontWeight: 600 }}>No active sittings right now</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Approved bookings will show up here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {active.map(a => {
            const h = homes.find(x => x.id === a.homeId);
            const pets = (h?.pets || []).map(pid => allPets[pid]).filter(Boolean);
            const primary = (h?.residents || []).map(uid => allUsers[uid]).find(u => u && u.isPrimary);
            const status = window.APPT_STATUS[a.status];
            return (
              <div key={a.id} className="card card-pad" style={{ borderLeft: `4px solid ${status.color}`, cursor: "pointer" }} onClick={() => onOpenHome(a.homeId)}>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                  <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 14, background: status.bg, color: status.fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{new Date(a.start).toLocaleString("en", { month: "short" }).toUpperCase()}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{new Date(a.start).getDate()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{h?.name}</div>
                      <ApptBadge status={a.status}/>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                      {primary?.name} · {h?.address}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      <strong>{window.fmtDate(a.start)}</strong> → <strong>{window.fmtDate(a.end)}</strong> · {window.daysBetween(a.start, a.end)} days · {pets.length} pet{pets.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpenHome(a.homeId); }}>Open →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminAllPets, AdminActiveSittings });

// Export Data Modal — pick scope + format, "download"
function ExportDataModal({ homes, allPets, allUsers, appointments, invoices, onClose, toast }) {
  const [scope, setScope]   = useState("all");        // all | home
  const [homeId, setHomeId] = useState(homes[0]?.id || "");
  const [datasets, setDatasets] = useState({
    homes: true, pets: true, residents: true, appointments: true, invoices: true,
  });
  const [format, setFormat] = useState("csv");        // csv | json | pdf

  const toggleDS = (k) => setDatasets(d => ({ ...d, [k]: !d[k] }));

  const handleExport = () => {
    // Build payload
    const targetHomes = scope === "all" ? homes : homes.filter(h => h.id === homeId);
    const targetHomeIds = new Set(targetHomes.map(h => h.id));

    const payload = {};
    if (datasets.homes) {
      payload.homes = targetHomes.map(h => ({
        id: h.id, name: h.name, address: h.address, status: h.status,
        accessKind: h.accessKind, accessDetail: h.accessDetail,
        wifiNetwork: h.wifiNetwork, wifiPassword: h.wifiPassword,
        emergencyVet: h.emergencyVet, emergencyPhone: h.emergencyPhone,
        notes: h.notes,
      }));
    }
    if (datasets.pets) {
      payload.pets = targetHomes.flatMap(h => (h.pets || []).map(pid => allPets[pid]).filter(Boolean).map(p => ({
        id: p.id, home: p.home, name: p.name, species: p.species, breed: p.breed,
        birthday: p.birthday, weight: p.weight, weightUnit: p.weightUnit,
        sex: p.sex, color: p.color,
        tags: (p.tags || []).join("; "),
        meds: (p.meds || []).map(m => `${m.name} (${m.dose}) — ${m.freq}`).join(" | "),
        vaccines: (p.vaccines || []).map(v => `${v.name} expires ${v.expires}`).join(" | "),
        incidentCount: (p.incidents || []).length,
      })));
    }
    if (datasets.residents) {
      payload.residents = targetHomes.flatMap(h => (h.residents || []).map(uid => allUsers[uid]).filter(Boolean).map(u => ({
        id: u.id, homeId: u.homeId, name: u.name, email: u.email, phone: u.phone, isPrimary: u.isPrimary,
      })));
    }
    if (datasets.appointments) {
      payload.appointments = (appointments || []).filter(a => targetHomeIds.has(a.homeId));
    }
    if (datasets.invoices) {
      payload.invoices = (invoices || []).filter(i => targetHomeIds.has(i.homeId));
    }

    const stamp = new Date().toISOString().split("T")[0];
    const baseName = scope === "all" ? "all-homes" : (targetHomes[0]?.name || "home").replace(/\W+/g, "-").toLowerCase();
    const filename = `jessicas-pet-sitting-${baseName}-${stamp}`;

    if (format === "json") {
      downloadBlob(JSON.stringify(payload, null, 2), filename + ".json", "application/json");
    } else if (format === "csv") {
      // One CSV per dataset, zipped into a single text file with section markers
      const parts = [];
      Object.entries(payload).forEach(([key, rows]) => {
        if (!rows || rows.length === 0) return;
        parts.push(`# ${key.toUpperCase()}`);
        parts.push(toCsv(rows));
        parts.push("");
      });
      downloadBlob(parts.join("\n"), filename + ".csv", "text/csv");
    } else if (format === "pdf") {
      // Open a print window with a styled report and let the user save as PDF
      openPrintReport(payload, filename);
    }

    toast(`Exported ${Object.keys(payload).filter(k => datasets[k]).length} dataset${Object.keys(payload).length === 1 ? "" : "s"}`);
    onClose();
  };

  const totalRecords = (
    (datasets.homes ? (scope === "all" ? homes.length : 1) : 0) +
    (datasets.pets ? homes.flatMap(h => h.pets || []).filter(pid => scope === "all" || homes.find(h => h.id === homeId)?.pets?.includes(pid)).length : 0) +
    (datasets.appointments ? (appointments || []).filter(a => scope === "all" || a.homeId === homeId).length : 0) +
    (datasets.invoices ? (invoices || []).filter(i => scope === "all" || i.homeId === homeId).length : 0)
  );

  return (
    <Modal
      size="lg"
      title="Export data"
      subtitle="Pick what to include and the format. Downloads to your device."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleExport}>
          <I.upload size={14}/> Export {totalRecords} record{totalRecords === 1 ? "" : "s"}
        </button>
      </>}
    >
      <div className="form-section">Scope</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setScope("all")} style={scopeBtnStyle(scope === "all")}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>All homes</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{homes.length} home{homes.length === 1 ? "" : "s"} on file</div>
        </button>
        <button onClick={() => setScope("home")} style={scopeBtnStyle(scope === "home")}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Single home</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Pick from list below</div>
        </button>
      </div>
      {scope === "home" && (
        <div className="field">
          <label>Home</label>
          <select className="select" value={homeId} onChange={e => setHomeId(e.target.value)}>
            {homes.map(h => <option key={h.id} value={h.id}>{h.name} — {h.address}</option>)}
          </select>
        </div>
      )}

      <div className="form-section">Datasets</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          ["homes",        "Homes",         "Name, address, access, wifi, vet, notes"],
          ["pets",         "Pets",          "Profiles, meds, vaccines"],
          ["residents",    "Household",     "Names, emails, phones, primary flag"],
          ["appointments", "Appointments",  "Past + upcoming bookings"],
          ["invoices",     "Invoices",      "All issued invoices and status"],
        ].map(([k, label, desc]) => (
          <button key={k} onClick={() => toggleDS(k)} style={dsBtnStyle(datasets[k])}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                border: "2px solid " + (datasets[k] ? "var(--green-deep)" : "var(--line-2)"),
                background: datasets[k] ? "var(--green)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
              }}>{datasets[k] && <I.check size={12}/>}</div>
              <strong style={{ fontSize: 13 }}>{label}</strong>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, textAlign: "left" }}>{desc}</div>
          </button>
        ))}
      </div>

      <div className="form-section">Format</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { id: "csv",  label: "CSV",  desc: "Open in Excel / Sheets" },
          { id: "json", label: "JSON", desc: "Raw structured data" },
          { id: "pdf",  label: "PDF",  desc: "Print-friendly report" },
        ].map(f => (
          <button key={f.id} onClick={() => setFormat(f.id)} style={scopeBtnStyle(format === f.id)}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: 10, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-3)" }}>
        Export contains sensitive personal information. Store securely and delete copies you don't need.
      </div>
    </Modal>
  );
}

const scopeBtnStyle = (active) => ({
  padding: 12, borderRadius: 12,
  border: active ? "2px solid var(--brown)" : "1.5px solid var(--line)",
  background: active ? "var(--bg-2)" : "var(--card)",
  cursor: "pointer", textAlign: "left",
});
const dsBtnStyle = (active) => ({
  padding: 12, borderRadius: 12,
  border: active ? "2px solid var(--green-deep)" : "1.5px solid var(--line)",
  background: active ? "color-mix(in oklab, var(--green) 8%, transparent)" : "var(--card)",
  cursor: "pointer", textAlign: "left",
});

function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = (v) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

function downloadBlob(data, filename, mime) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function openPrintReport(payload, filename) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>${filename}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
      h1 { font-size: 24px; margin: 0 0 4px; }
      h2 { font-size: 16px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; text-transform: uppercase; letter-spacing: 0.08em; color: #555; }
      table { border-collapse: collapse; width: 100%; font-size: 11px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background: #f5f5f5; }
      .hdr { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 12px; }
      .ts { font-size: 11px; color: #777; }
      @page { margin: 0.5in; }
    </style></head><body>
    <div class="hdr">
      <div><h1>Jessica's Pet Sitting</h1><div style="font-size:13px;color:#555;">Data Export</div></div>
      <div class="ts">${new Date().toLocaleString()}</div>
    </div>`;
  Object.entries(payload).forEach(([key, rows]) => {
    if (!rows || rows.length === 0) return;
    const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
    html += `<h2>${key} (${rows.length})</h2><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>`;
    rows.forEach(r => {
      html += "<tr>" + cols.map(c => `<td>${r[c] == null ? "" : (typeof r[c] === "object" ? JSON.stringify(r[c]) : String(r[c]).slice(0, 200))}</td>`).join("") + "</tr>";
    });
    html += "</tbody></table>";
  });
  html += "</body></html>";
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch {}
    setTimeout(() => document.body.removeChild(frame), 500);
  }, 200);
}

window.ExportDataModal = ExportDataModal;

// Google Calendar icon (simplified branded glyph)
function GoogleCalIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="2.5" fill="#fff" stroke="#DADCE0" strokeWidth="1"/>
      <rect x="3" y="4" width="18" height="4" rx="2.5" fill="#4285F4"/>
      <text x="12" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="#4285F4">31</text>
      <line x1="8" y1="2" x2="8" y2="6" stroke="#5F6368" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="#5F6368" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Edit/Add team member modal
function TeamMemberModal({ member, onClose, onSave, onResetPassword }) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [role, setRole] = useState(member?.role || "Admin");
  return (
    <Modal
      title={member ? "Edit team member" : "Add team member"}
      subtitle={member ? "Update name, email, or role." : "Invite a trusted teammate. They'll get an email to set their password."}
      onClose={onClose}
      footer={<>
        {member && onResetPassword && (
          <button className="btn btn-outline" style={{ marginRight: "auto" }} onClick={onResetPassword}>
            <I.key size={14}/> Reset password
          </button>
        )}
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => name && onSave({ name, email, role })}>{member ? "Save changes" : "Send invite"}</button>
      </>}
    >
      <div className="field"><label>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Connor"/></div>
      <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"/></div>
      <div className="field">
        <label>Role</label>
        <select className="select" value={role} onChange={e => setRole(e.target.value)}>
          <option>Owner · Admin</option>
          <option>Admin</option>
          <option>Senior sitter</option>
          <option>Sitter</option>
        </select>
      </div>
    </Modal>
  );
}

// "Sync with Google Calendar" modal from the schedule.
// .ics export now actually generates a real RFC 5545 file from your appointments.
function CalendarExportModal({ onClose, appointments = [], homes = [] }) {
  const [mode, setMode] = useState("ics"); // ics | sync | link
  const [done, setDone] = useState(false);

  const handleGo = () => {
    if (mode === "ics") {
      // Build a real .ics file from approved + pending sittings
      const ics = buildICS(appointments, homes);
      const blob = new Blob([ics], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "jessicas-pet-sitting.ics";
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } else if (mode === "link") {
      const url = window.location.origin + "/cal/feed.ics";
      try { navigator.clipboard?.writeText(url); } catch {}
    }
    setDone(true);
    setTimeout(onClose, 1400);
  };

  const count = appointments.filter(a => a.status !== "rejected").length;

  return (
    <Modal
      title="Sync with Google Calendar"
      subtitle="Download a portable .ics file you can import into any calendar app."
      onClose={onClose}
      footer={done ? null : <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleGo} disabled={mode === "sync"} style={mode === "sync" ? { opacity: 0.5 } : null}>
          {mode === "sync" ? "Coming after launch" : mode === "ics" ? "Download .ics" : "Copy subscribe link"}
        </button>
      </>}
    >
      {done ? (
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 10px", borderRadius: "50%", background: "#E6F0E1", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.check size={26}/>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {mode === "ics" ? `${count} bookings exported` : "Link copied"}
          </div>
          <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>
            Import into Google Calendar via Settings → Import & export → Select file.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { k: "ics",   t: ".ics download", d: "Works now" },
              { k: "link",  t: "Subscribe URL", d: "Auto-refresh" },
              { k: "sync",  t: "Live OAuth",    d: "Coming soon", disabled: true },
            ].map(o => (
              <button key={o.k} onClick={() => !o.disabled && setMode(o.k)} disabled={o.disabled} style={{
                padding: 12,
                borderRadius: 12,
                border: mode === o.k ? "2px solid var(--brown)" : "1.5px solid var(--line)",
                background: mode === o.k ? "var(--bg-2)" : "var(--card)",
                cursor: o.disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                opacity: o.disabled ? 0.5 : 1,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o.t}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{o.d}</div>
              </button>
            ))}
          </div>
          {mode === "ics" && (
            <div style={{ padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 13, color: "var(--ink-2)" }}>
              Downloads <span className="mono">jessicas-pet-sitting.ics</span> with {count} booking{count === 1 ? "" : "s"}. Works with Google Calendar, Apple Calendar, Outlook.
            </div>
          )}
          {mode === "link" && (
            <div className="field">
              <label>Subscribe URL</label>
              <input className="input mono" readOnly value={`${window.location.origin}/cal/feed.ics`} style={{ fontSize: 12 }}/>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                <strong>Coming after launch:</strong> this URL will be served by a Firebase function that streams a live feed. For now, use the .ics download.
              </div>
            </div>
          )}
          {mode === "sync" && (
            <div style={{ padding: 12, background: "#FCEFD3", border: "1px solid #E8D9A8", borderRadius: 10, fontSize: 13, color: "#7A5615" }}>
              <strong>Live two-way sync</strong> needs Google OAuth and a Cloud Function. We'll enable it after launching on the production domain — see FIREBASE-SETUP.md.
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// Build an RFC 5545 .ics file from appointments
function buildICS(appointments, homes) {
  const pad = (n) => String(n).padStart(2, "0");
  const dtFmt = (iso) => {
    const d = new Date(iso);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  };
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/[\n\r]/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jessica's Pet Sitting//Web//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Jessica's Pet Sitting",
    "X-WR-TIMEZONE:America/Chicago",
  ];
  (appointments || []).filter(a => a.status !== "rejected" && a.status !== "completed").forEach(a => {
    const home = homes.find(h => h.id === a.homeId);
    const title = home ? `Sitting at ${home.name}` : "Pet sitting";
    const status = a.status === "approved" ? "CONFIRMED" : a.status === "pending" ? "TENTATIVE" : "CONFIRMED";
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + a.id + "@jessicakpetsitting.com");
    lines.push("DTSTAMP:" + dtFmt(new Date().toISOString()));
    lines.push("DTSTART:" + dtFmt(a.start));
    lines.push("DTEND:" + dtFmt(a.end));
    lines.push("SUMMARY:" + esc(title));
    if (home?.address) lines.push("LOCATION:" + esc(home.address));
    const desc = [
      home ? `Home: ${home.name}` : null,
      home?.address ? `Address: ${home.address}` : null,
      a.notes ? `Notes: ${a.notes}` : null,
      `Status: ${a.status}`,
    ].filter(Boolean).join("\\n");
    if (desc) lines.push("DESCRIPTION:" + desc);
    lines.push("STATUS:" + status);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
