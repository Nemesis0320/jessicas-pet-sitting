// Pet detail screen
const PET_TABS = [
  { id: "care", label: "Care", icon: "note" },
  { id: "medical", label: "Medical", icon: "pill" },
  { id: "daily", label: "Daily", icon: "check" },
  { id: "incidents", label: "Incidents", icon: "bell" },
];

function PetDetailScreen({ pet, home, onBack, onUpdate, onEdit, onDelete, toast }) {
  const [tab, setTab] = useState("care");
  const [photos, setPhotos] = useState(pet.photos || []);
  const [activePhoto, setActivePhoto] = useState(0);
  const [editingCare, setEditingCare] = useState(false);
  const [careDraft, setCareDraft] = useState(pet.care);
  const fileRef = useRef();

  // Lifted state slices
  const [notes, setNotes]   = useState(pet.notes || []);
  const [meds, setMeds]     = useState(pet.meds || []);
  const [vaccines, setVaccines] = useState(pet.vaccines || []);
  const [incidents, setIncidents] = useState(pet.incidents || []);
  const [checklist, setChecklist] = useState(pet.checklist || {});

  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddVax, setShowAddVax] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);

  const persist = (patch) => onUpdate({ ...pet, ...patch });

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 8);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => {
          const next = [...prev, ev.target.result];
          setActivePhoto(next.length - 1);
          return next;
        });
      };
      reader.readAsDataURL(f);
    });
    toast(arr.length + " photo" + (arr.length > 1 ? "s" : "") + " uploaded");
  };

  const saveCare = () => {
    persist({ care: careDraft });
    setEditingCare(false);
    toast("Care notes saved");
  };

  const removeMed = (id) => {
    const next = meds.filter(m => m.id !== id);
    setMeds(next);
    persist({ meds: next });
    toast("Medication removed");
  };

  const removeVax = (id) => {
    const next = vaccines.filter(v => v.id !== id);
    setVaccines(next);
    persist({ vaccines: next });
    toast("Vaccine removed");
  };

  const removeIncident = (id) => {
    const next = incidents.filter(i => i.id !== id);
    setIncidents(next);
    persist({ incidents: next });
    toast("Incident removed");
  };

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.back size={14}/> Back to home</button>
        <div className="row">
          <button className="btn btn-outline btn-sm" onClick={onEdit}><I.edit size={14}/> Edit pet</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><I.trash size={14}/> Remove</button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left: hero + gallery */}
        <div>
          <div className="detail-hero">
            {photos.length > 0 ? (
              <img src={photos[activePhoto]} alt={pet.name} />
            ) : (
              <PetPhoto pet={pet} large />
            )}
            <button className="upload-cta" onClick={() => fileRef.current.click()}>
              <I.camera size={14}/> Upload photos
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: "none" }}/>
          </div>
          <div className="gallery">
            {photos.map((src, i) => (
              <div key={i} className={"thumb " + (i === activePhoto ? "active" : "")} onClick={() => setActivePhoto(i)}>
                <img src={src} alt=""/>
              </div>
            ))}
            <div className="thumb add" onClick={() => fileRef.current.click()}>
              <I.plus size={20}/>
            </div>
          </div>

          {/* Pet info card */}
          <div className="card card-pad" style={{ marginTop: 18 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{pet.name}</div>
                <div style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>{pet.breed} · {pet.species}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {pet.tags.map(t => <span key={t} className="tag green">{t}</span>)}
              </div>
            </div>
            <dl className="kv">
              <dt>Age</dt><dd>{window.computeAge(pet.birthday) || "—"}</dd>
              <dt>Birthday</dt><dd>{pet.birthday ? new Date(pet.birthday).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) : <em style={{ color: "var(--ink-3)", fontWeight: 500 }}>not set</em>}</dd>
              <dt>Weight</dt><dd>{pet.weight ? `${pet.weight} ${pet.weightUnit || "lb"}` : "—"}</dd>
              <dt>Sex</dt><dd>{pet.sex}</dd>
              <dt>Color</dt><dd>{pet.color}</dd>
              <dt>Home</dt><dd>{home?.name || "—"}</dd>
            </dl>
          </div>
        </div>

        {/* Right: tabs */}
        <div>
          <div className="tabs">
            <button className={tab === "care" ? "active" : ""} onClick={() => setTab("care")}><I.note size={14}/> &nbsp;Care</button>
            <button className={tab === "medical" ? "active" : ""} onClick={() => setTab("medical")}><I.pill size={14}/> &nbsp;Medical
              {(meds.length + vaccines.length) > 0 && <span className="tab-count">{meds.length + vaccines.length}</span>}
            </button>
            <button className={tab === "daily" ? "active" : ""} onClick={() => setTab("daily")}><I.check size={14}/> &nbsp;Daily</button>
            <button className={tab === "incidents" ? "active" : ""} onClick={() => setTab("incidents")}><I.bell size={14}/> &nbsp;Incidents
              {incidents.length > 0 && <span className="tab-count">{incidents.length}</span>}
            </button>
          </div>

          {tab === "care" && (
            <div className="card card-pad">
              <div className="between" style={{ marginBottom: 10 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>Daily care & routine</h2>
                {!editingCare ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setCareDraft(pet.care); setEditingCare(true); }}><I.edit size={14}/> Edit</button>
                ) : (
                  <div className="row">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingCare(false)}>Cancel</button>
                    <button className="btn btn-green btn-sm" onClick={saveCare}><I.check size={14}/> Save</button>
                  </div>
                )}
              </div>
              {editingCare ? (
                <textarea className="textarea" value={careDraft} onChange={e => setCareDraft(e.target.value)} rows={8}/>
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>{pet.care}</div>
              )}
            </div>
          )}

          {tab === "medical" && (
            <MedicalTab
              meds={meds} vaccines={vaccines}
              onRemoveMed={removeMed} onRemoveVax={removeVax}
              onAddMed={() => setShowAddMed(true)}
              onAddVax={() => setShowAddVax(true)}
            />
          )}

          {tab === "daily" && (
            <DailyTab
              pet={pet} meds={meds} notes={notes} checklist={checklist}
              onChecklistChange={(next) => { setChecklist(next); persist({ checklist: next }); }}
              onUpdatePet={(updated) => { onUpdate(updated); }}
              onPostNote={(text) => {
                const n = { who: "Sarah", when: "Just now", text };
                const next = [n, ...notes];
                setNotes(next); persist({ notes: next });
                toast("Note added");
              }}
            />
          )}

          {tab === "incidents" && (
            <IncidentsTab
              incidents={incidents}
              onAdd={() => setShowAddIncident(true)}
              onRemove={removeIncident}
            />
          )}
        </div>
      </div>

      {showAddMed && (
        <AddMedModal onClose={() => setShowAddMed(false)} onAdd={(med) => {
          const next = [...meds, { ...med, id: "m" + Date.now() }];
          setMeds(next); persist({ meds: next });
          setShowAddMed(false);
          toast("Medication added");
        }}/>
      )}
      {showAddVax && (
        <AddVaccineModal onClose={() => setShowAddVax(false)} onAdd={(v) => {
          const next = [...vaccines, { ...v, id: "v" + Date.now() }];
          setVaccines(next); persist({ vaccines: next });
          setShowAddVax(false);
          toast("Vaccine added");
        }}/>
      )}
      {showAddIncident && (
        <AddIncidentModal onClose={() => setShowAddIncident(false)} onAdd={(inc) => {
          const next = [{ ...inc, id: "i" + Date.now() }, ...incidents];
          setIncidents(next); persist({ incidents: next });
          setShowAddIncident(false);
          toast("Incident logged");
          // Always email both admins and the homeowner regardless of preferences
          const adminEmails = ["jessica@jessicaspetsitting.com", "connor@jessicaspetsitting.com"];
          const ownerEmail = (home?.residents || []).map(uid => window.SEED.users?.[uid]).find(u => u && u.isPrimary)?.email;
          const severityLabel = { minor: "Minor", moderate: "Moderate", major: "Major" }[inc.severity] || "Notable";
          const recipients = ownerEmail ? [...adminEmails, ownerEmail] : adminEmails;
          window.__pushNotif?.(recipients, {
            kind: "incident_logged",
            title: `${severityLabel} incident logged for ${pet.name}`,
            summary: inc.summary,
            fields: [
              { label: "Pet",      value: `${pet.name} (${pet.species})` },
              { label: "Home",     value: home?.name || "—" },
              { label: "Date",     value: new Date(inc.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) },
              { label: "Severity", value: severityLabel },
              { label: "Photos",   value: (inc.photos || []).length ? `${(inc.photos || []).length} attached` : "None" },
            ],
            body: `Hi —\n\nA ${severityLabel.toLowerCase()} incident was logged for ${pet.name}:\n\n"${inc.summary}"\n\nPlease reach out to Jessica directly if you have any questions.`,
            cta: "View incident",
          });
        }}/>
      )}
    </div>
  );
}

function MedicalTab({ meds, vaccines, onRemoveMed, onRemoveVax, onAddMed, onAddVax }) {
  // Vaccine status helpers
  const vaxStatus = (v) => {
    const days = window.daysUntil(v.expires);
    if (days == null) return { color: "var(--ink-3)", bg: "var(--bg-2)", label: "—" };
    if (days < 0)     return { color: "var(--heart)", bg: "#FBE0E0", label: `${Math.abs(days)} d overdue` };
    if (days <= 30)   return { color: "#7A5615",      bg: "#FCEFD3", label: `${days} d left` };
    return                  { color: "var(--green-deep)", bg: "#E6F0E1", label: `${days} d left` };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Medications & supplements <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)" }}>· {meds.length}</span></h2>
          <button className="btn btn-primary btn-sm" onClick={onAddMed}><I.plus size={14}/> Add medication</button>
        </div>
        {meds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--ink-3)" }}>
            <I.pill size={24}/>
            <div style={{ marginTop: 6, fontSize: 13 }}>No medications on file.</div>
          </div>
        ) : (
          <div className="med-list">
            {meds.map(m => (
              <div key={m.id} className="med-item">
                <div className={"pill-icon " + (m.color || "")}><I.pill size={18}/></div>
                <div className="info">
                  <div className="t">{m.name} <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>· {m.dose}</span></div>
                  <div className="d">{m.freq}</div>
                </div>
                <button className="more" onClick={() => onRemoveMed(m.id)} title="Remove"><I.trash size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Vaccinations <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)" }}>· {vaccines.length}</span></h2>
          <button className="btn btn-primary btn-sm" onClick={onAddVax}><I.plus size={14}/> Add vaccine</button>
        </div>

        {vaccines.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--ink-3)" }}>
            <I.shield size={24}/>
            <div style={{ marginTop: 6, fontSize: 13 }}>No vaccine records yet — add rabies, distemper, etc.</div>
          </div>
        ) : (
          <div className="med-list">
            {vaccines.map(v => {
              const s = vaxStatus(v);
              return (
                <div key={v.id} className="med-item">
                  <div className="pill-icon green" style={{ background: s.bg, color: s.color }}><I.shield size={18}/></div>
                  <div className="info">
                    <div className="t">{v.name}</div>
                    <div className="d">Given {v.given ? new Date(v.given).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—"} · Expires {v.expires ? new Date(v.expires).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 6, display: "inline-block", padding: "2px 8px", background: s.bg, borderRadius: 999 }}>{s.label}</div>
                  </div>
                  <button className="more" onClick={() => onRemoveVax(v.id)} title="Remove"><I.trash size={16}/></button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-2)" }}>
          <strong>Tip:</strong> Owners and admins are reminded 30 days before any vaccine expires.
        </div>
      </div>
    </div>
  );
}

function todayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
function timeNow() {
  return new Date().toLocaleString("en", { hour: "numeric", minute: "2-digit" });
}

function DailyTab({ pet, meds, notes, checklist, onChecklistChange, onPostNote, onUpdatePet }) {
  const day = todayKey();
  const today = checklist[day] || { items: {}, photos: [], note: "" };
  const [newNote, setNewNote] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // index of item being renamed
  const [editLabel, setEditLabel] = useState("");
  const fileRef = useRef();

  // Custom checklist items live on the pet record as `customChecklist: string[]`.
  // Pet starts with NO items by default — owner populates via Quick-add or Custom.
  const customItems = (pet.customChecklist || []).map((label, i) => ({ id: "cust-" + i, label, custom: true, idx: i }));

  // Quick-add chips include common defaults + a wider pool.
  const QUICK_ADDS = [
    // Daily essentials
    "Morning feeding", "Evening feeding", "Fresh water",
    "Walk / playtime", "Litter / waste check",
    // Grooming
    "Brush teeth", "Brush coat", "Trim nails", "Clean ears",
    // Activity
    "Indoor playtime", "Outdoor exercise", "Treat / chew",
    "Backyard time", "Window perch time",
    // Maintenance
    "Refill food bowl", "Refill water fountain",
    "Clean litter box", "Yard cleanup",
    // Health
    "Health check (eyes, ears, paws)",
  ];

  // Items rendered = customItems + medItems. NO hardcoded standards anymore.
  const medItems = (meds || []).map(m => ({ id: "med-" + m.id, label: `Medication: ${m.name}` }));
  const items = [...customItems, ...medItems];

  const addCustom = (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if ((pet.customChecklist || []).includes(trimmed)) { setCustomLabel(""); return; }
    const next = [...(pet.customChecklist || []), trimmed];
    onUpdatePet({ ...pet, customChecklist: next });
    setCustomLabel("");
  };
  const removeCustom = (idx) => {
    const next = (pet.customChecklist || []).filter((_, i) => i !== idx);
    onUpdatePet({ ...pet, customChecklist: next });
    // Also remove any check + rekey today's items so the index shift doesn't strand checks
    const newItems = {};
    Object.entries(today.items).forEach(([k, v]) => {
      if (!k.startsWith("cust-")) { newItems[k] = v; return; }
      const i = parseInt(k.slice(5), 10);
      if (i === idx) return;
      const newI = i > idx ? i - 1 : i;
      newItems["cust-" + newI] = v;
    });
    onChecklistChange({ ...checklist, [day]: { ...today, items: newItems } });
  };
  const startEdit = (idx, label) => { setEditingItem(idx); setEditLabel(label); };
  const saveEdit = () => {
    const trimmed = editLabel.trim();
    if (!trimmed || editingItem == null) { setEditingItem(null); return; }
    const next = (pet.customChecklist || []).map((l, i) => i === editingItem ? trimmed : l);
    onUpdatePet({ ...pet, customChecklist: next });
    setEditingItem(null);
  };

  const toggle = (itemId) => {
    const cur = today.items[itemId];
    const items = { ...today.items };
    if (cur) delete items[itemId];
    else items[itemId] = timeNow();
    onChecklistChange({ ...checklist, [day]: { ...today, items } });
  };

  const addPhotoToday = (files) => {
    const arr = Array.from(files).slice(0, 3);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => {
        const next = {
          ...checklist,
          [day]: { ...today, photos: [...(today.photos || []), { src: ev.target.result, time: timeNow() }] }
        };
        onChecklistChange(next);
      };
      reader.readAsDataURL(f);
    });
  };

  const completedCount = Object.keys(today.items).length;
  const totalCount = items.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // History (past days, sorted desc)
  const history = Object.entries(checklist)
    .filter(([k]) => k !== day)
    .sort((a, b) => b[0].localeCompare(a[0]));

  const post = () => {
    if (!newNote.trim()) return;
    onPostNote(newNote.trim());
    setNewNote("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Today's checklist */}
      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Today · {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "var(--green-deep)" : "var(--ink-3)", padding: "4px 10px", background: pct === 100 ? "#E6F0E1" : "var(--bg-2)", borderRadius: 999 }}>
            {pct === 100 ? "✓ All done" : `${completedCount} / ${totalCount}`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--brown)", borderRadius: 999, transition: "width .3s ease" }}/>
        </div>

        {/* Checklist items */}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--ink-3)", border: "1.5px dashed var(--line)", borderRadius: 12 }}>
            <I.check size={28}/>
            <div style={{ fontWeight: 700, color: "var(--ink-2)", marginTop: 8 }}>No checklist items yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add the things you'd like the sitter to do each day for {pet.name}.</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCustom(true)} style={{ marginTop: 12 }}>
              <I.plus size={14}/> Build a checklist
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((it) => {
              const done = !!today.items[it.id];
              const time = today.items[it.id];
              const customIdx = it.custom ? it.idx : -1;
              const isEditing = it.custom && editingItem === customIdx;
              return (
                <div key={it.id} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                  {isEditing ? (
                    <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center", padding: "6px 8px", border: "2px solid var(--brown)", borderRadius: 12, background: "var(--card)" }}>
                      <input className="input" autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); saveEdit(); } if (e.key === "Escape") setEditingItem(null); }}
                        style={{ flex: 1, padding: "6px 10px", fontSize: 14 }}/>
                      <button className="btn btn-green btn-sm" onClick={saveEdit}><I.check size={13}/></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingItem(null)}><I.x size={13}/></button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => toggle(it.id)} style={{
                        flex: 1,
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        background: done ? "#E6F0E1" : "var(--card)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background .15s ease",
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          border: "2px solid " + (done ? "var(--green-deep)" : "var(--line-2)"),
                          background: done ? "var(--green)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                        }}>
                          {done && <I.check size={14}/>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: done ? "var(--green-deep)" : "var(--ink)", textDecoration: done ? "line-through" : "none" }}>
                            {it.label}
                          </div>
                        </div>
                        {done && (
                          <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{time}</span>
                        )}
                      </button>
                      {it.custom && (
                        <>
                          <button onClick={() => startEdit(customIdx, it.label)} title="Rename"
                            style={{ width: 36, border: "1px solid var(--line)", borderRadius: 12, background: "var(--card)", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <I.edit size={13}/>
                          </button>
                          <button onClick={() => removeCustom(customIdx)} title="Remove from checklist"
                            style={{ width: 36, border: "1px solid var(--line)", borderRadius: 12, background: "var(--card)", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <I.x size={14}/>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Customize checklist */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          {!showCustom ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCustom(true)}>
              <I.plus size={14}/> Customize this checklist
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>QUICK ADD</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK_ADDS.filter(q => !(pet.customChecklist || []).includes(q)).map(q => (
                  <button key={q} onClick={() => addCustom(q)} style={{
                    fontSize: 12, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 999,
                    border: "1.5px solid var(--line)", background: "var(--card)",
                    color: "var(--ink-2)", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <I.plus size={11}/> {q}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em", marginTop: 6 }}>CUSTOM ITEM</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" value={customLabel} onChange={e => setCustomLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom(customLabel))} placeholder={`e.g. "Refresh cat tree" or "Check garden hose"`}/>
                <button className="btn btn-outline btn-sm" onClick={() => addCustom(customLabel)}>Add</button>
              </div>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCustom(false)}>Done</button>
              </div>
            </div>
          )}
        </div>

        {/* Today's photos */}
        {(today.photos || []).length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>TODAY'S PHOTOS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {today.photos.map((p, i) => (
                <div key={i} style={{ aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                  <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 10, fontWeight: 700, color: "#fff", padding: "2px 6px", background: "rgba(0,0,0,0.6)", borderRadius: 4 }}>{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 14, gap: 8 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => addPhotoToday(e.target.files)} style={{ display: "none" }}/>
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
            <I.camera size={14}/> Add photo to today
          </button>
        </div>
      </div>

      {/* Sitter log notes */}
      <div className="card card-pad">
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Sitter notes</h2>
        <textarea
          className="textarea"
          placeholder={`Leave a quick note about ${pet.name}…`}
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={3}
          style={{ minHeight: 70 }}
        />
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 8, marginBottom: 14 }}>
          <button className="btn btn-green btn-sm" onClick={post} disabled={!newNote.trim()} style={{ opacity: newNote.trim() ? 1 : 0.5 }}>Post note</button>
        </div>

        {notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px", color: "var(--ink-3)", fontSize: 13 }}>
            No notes yet. Yours will show up here.
          </div>
        ) : notes.map((n, i) => (
          <div key={i} className="note">
            <div className="head">
              <div className="avatar">{n.who[0]}</div>
              <div><strong style={{ color: "var(--ink-2)" }}>{n.who}</strong> · {n.when}</div>
            </div>
            <div className="body">{n.text}</div>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <details className="card card-pad">
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Past days ({history.length})</summary>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(([k, day]) => {
              const c = Object.keys(day.items || {}).length;
              return (
                <div key={k} className="row" style={{ justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-2)", borderRadius: 10, fontSize: 13 }}>
                  <span>{new Date(k).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span style={{ fontWeight: 600, color: "var(--green-deep)" }}>{c} item{c === 1 ? "" : "s"} checked</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

const SEVERITY = {
  minor:    { label: "Minor",    color: "#7A5615",      bg: "#FCEFD3" },
  moderate: { label: "Moderate", color: "#A04C3B",      bg: "#FCE3D3" },
  major:    { label: "Major",    color: "#8B2929",      bg: "#FBE0E0" },
};

function IncidentsTab({ incidents, onAdd, onRemove }) {
  return (
    <div className="card card-pad">
      <div className="between" style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Incident log <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)" }}>· {incidents.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={onAdd}><I.plus size={14}/> Log incident</button>
      </div>

      {incidents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--ink-3)" }}>
          <I.shield size={32}/>
          <div style={{ marginTop: 8, fontWeight: 600 }}>No incidents on record</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Log anything notable — bites, escapes, vet visits, or unusual behavior — for the long-term record.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {incidents.map(i => {
            const s = SEVERITY[i.severity] || SEVERITY.minor;
            return (
              <div key={i.id} style={{
                padding: 14, border: "1px solid var(--line)",
                borderRadius: 14, background: "var(--card)",
                borderLeft: `3px solid ${s.color}`,
              }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{new Date(i.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <button className="more" onClick={() => onRemove(i.id)} title="Remove"><I.trash size={14}/></button>
                </div>
                <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{i.summary}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="alert" style={{ marginTop: 18 }}>
        <div className="dot"/>
        <div><strong>For your records.</strong> Incidents help build a complete history and stay relevant for years.</div>
      </div>
    </div>
  );
}

function AddMedModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState("Once daily — morning with food");
  const [color, setColor] = useState("amber");
  return (
    <Modal
      title="Add a medication"
      subtitle="Track pills, supplements, or topical treatments."
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => name && onAdd({ name, dose, freq, color })}>Add medication</button>
        </>
      }
    >
      <div className="field"><label>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apoquel"/></div>
      <div className="field"><label>Dose</label><input className="input" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 8mg tablet"/></div>
      <div className="field"><label>Frequency</label><input className="input" value={freq} onChange={e => setFreq(e.target.value)}/></div>
      <div className="field">
        <label>Category color</label>
        <div className="row" style={{ gap: 8 }}>
          {[["amber","#E8A33D"],["green","#3A6B33"],["purple","#6B3FA0"],["red","#D94545"]].map(([k, c]) => (
            <button key={k} onClick={() => setColor(k)} style={{
              width: 32, height: 32, borderRadius: 8, border: color === k ? "2.5px solid var(--ink)" : "2.5px solid transparent",
              background: c, cursor: "pointer", padding: 0
            }}/>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function AddVaccineModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const today = todayKey();
  const [given, setGiven] = useState(today);
  const [expires, setExpires] = useState("");
  return (
    <Modal
      title="Add a vaccine record"
      subtitle="Track expiration so we can remind everyone in time."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => name && onAdd({ name, given, expires })}>Add vaccine</button>
      </>}
    >
      <div className="field">
        <label>Vaccine</label>
        <select className="select" value={name} onChange={e => setName(e.target.value)}>
          <option value="">Choose…</option>
          <option>Rabies</option><option>DHPP</option><option>Bordetella</option><option>FVRCP</option><option>Feline Leukemia</option><option>Lyme</option><option>Influenza</option><option>Other</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Date given</label><input className="input" type="date" value={given} onChange={e => setGiven(e.target.value)}/></div>
        <div className="field"><label>Expires</label><input className="input" type="date" value={expires} onChange={e => setExpires(e.target.value)}/></div>
      </div>
      <div style={{ padding: 10, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-3)" }}>
        Upload of the actual record (PDF/photo) is supported on the full version.
      </div>
    </Modal>
  );
}

function AddIncidentModal({ onClose, onAdd }) {
  const [date, setDate] = useState(todayKey());
  const [severity, setSeverity] = useState("minor");
  const [summary, setSummary] = useState("");
  const [photos, setPhotos] = useState([]);
  const fileRef = useRef();

  const handleFiles = (files) => {
    Array.from(files).slice(0, 5).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  return (
    <Modal
      title="Log an incident"
      subtitle="Anything notable about this pet — escapes, bites, vet visits, unusual behavior."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => summary.trim() && onAdd({ date, severity, summary: summary.trim(), photos })}>Log incident</button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Date</label><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
        <div className="field">
          <label>Severity</label>
          <select className="select" value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="major">Major</option>
          </select>
        </div>
      </div>
      <div className="field"><label>What happened</label><textarea className="textarea" rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Describe what happened, what was done about it, and any follow-up needed."/></div>
      <div className="field">
        <label>Photos <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional, up to 5)</span></label>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: "none" }}/>
        {photos.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
            {photos.map((src, i) => (
              <div key={i} style={{ aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
          <I.camera size={14}/> Attach photo
        </button>
      </div>
      <div className="alert" style={{ marginTop: 6, background: "#FBE0E0", color: "#6B1F1F", border: "1px solid #F2C7C7" }}>
        <div className="dot"/>
        <div><strong>Always emailed.</strong> An incident report is sent to the homeowner and admin team — regardless of notification preferences.</div>
      </div>
    </Modal>
  );
}

window.PetDetailScreen = PetDetailScreen;
