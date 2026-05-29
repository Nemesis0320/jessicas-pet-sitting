// User home dashboard — one home, one or many pets, household members, appointments
function UserHomeScreen({ user, home, pets, residents, appointments, invoices, pricing, onOpenPet, onAddPet, onEditHome, onEditProfile, onRequestAppt, onEditAppt, onCancelAppt, toast }) {
  const totalMeds = pets.reduce((n, p) => n + (p.meds?.length || 0), 0);
  const totalNotes = pets.reduce((n, p) => n + (p.notes?.length || 0), 0);

  const upcoming = appointments
    .filter(a => a.status !== "completed" && a.status !== "rejected" && new Date(a.end) > new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextAppt = upcoming.find(a => a.status === "approved" || a.status === "ongoing") || upcoming[0];
  const past = appointments
    .filter(a => a.status === "completed" || a.status === "rejected" || new Date(a.end) <= new Date())
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  const [medsModal, setMedsModal] = React.useState(false);
  const [memberModal, setMemberModal] = React.useState(null);
  const [householdModal, setHouseholdModal] = React.useState(false);
  const [invoiceModal, setInvoiceModal] = React.useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    el.classList.add("flash-highlight");
    setTimeout(() => el.classList.remove("flash-highlight"), 1400);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">good morning,</div>
          <h1>{user.name.split(" ")[0]}'s home 🐾</h1>
          <div className="sub">
            {nextAppt ? (
              <>Next sitting: <strong style={{ color: "var(--ink)" }}>{window.fmtDateShort(nextAppt.start)} – {window.fmtDateShort(nextAppt.end)}</strong> · <ApptBadge status={nextAppt.status}/></>
            ) : (
              <>No upcoming sittings. <a href="#" onClick={e => { e.preventDefault(); onRequestAppt(); }} style={{ color: "var(--brown)", fontWeight: 700 }}>Request one →</a></>
            )}
          </div>
        </div>
        <div className="row">
          <button className="btn btn-outline" onClick={onEditProfile}><I.user size={14}/> My profile</button>
          <button className="btn btn-outline" onClick={onEditHome}><I.home size={14}/> Edit home</button>
          <button className="btn btn-green" onClick={onRequestAppt}><I.calendar size={14}/> Request sitting</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat stat-clickable" onClick={() => scrollTo("section-sittings")}>
          <div className="icon" style={{ background: "#FCEFD3", color: "#7A5615" }}><I.calendar size={20}/></div>
          <div><div className="num">{appointments.filter(a => a.status === "pending" || a.status === "approved").length}</div><div className="lbl">Upcoming sittings</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => scrollTo("section-pets")}>
          <div className="icon" style={{ background: "#E6F0E1", color: "var(--green-deep)" }}><I.paw size={20}/></div>
          <div><div className="num">{pets.length}</div><div className="lbl">Pets in care</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => setMedsModal(true)}>
          <div className="icon" style={{ background: "#EDE3F7", color: "var(--purple-deep)" }}><I.pill size={20}/></div>
          <div><div className="num">{totalMeds}</div><div className="lbl">Medications tracked</div></div>
        </div>
        <div className="stat stat-clickable" onClick={() => setHouseholdModal(true)}>
          <div className="icon" style={{ background: "#FBE0E0", color: "#8B2929" }}><I.user size={20}/></div>
          <div><div className="num">{residents.length}</div><div className="lbl">Household members</div></div>
        </div>
      </div>

      {/* Appointments */}
      <div className="section" id="section-sittings" style={{ marginTop: 0 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Sittings <span className="count">{upcoming.length} upcoming</span></h2>
          <button className="btn btn-primary btn-sm" onClick={onRequestAppt}><I.plus size={14}/> Request sitting</button>
        </div>

        {upcoming.length === 0 && past.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>
            <I.calendar size={32}/>
            <div style={{ marginTop: 8, fontWeight: 700, color: "var(--ink-2)" }}>No sittings yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Heading out of town? Request your first sitting.</div>
            <button className="btn btn-primary" onClick={onRequestAppt} style={{ marginTop: 14 }}><I.plus size={14}/> Request sitting</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(a => (
              <ApptCard key={a.id} appt={a} canEdit onEdit={() => onEditAppt(a)} onCancel={() => onCancelAppt(a.id)}/>
            ))}
            {past.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-3)", fontWeight: 600, padding: "8px 0" }}>Past sittings ({past.length})</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  {past.map(a => <ApptCard key={a.id} appt={a} canEdit={false}/>)}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Home info card */}
      <div className="card card-pad" style={{ marginTop: 26, marginBottom: 24 }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em" }}>HOME DETAILS</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{home.name}</div>
            <div style={{ color: "var(--ink-3)", fontSize: 13 }}>{home.address}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onEditHome}><I.edit size={14}/> Edit</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 8 }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <div style={{ color: "var(--ink-3)" }}><I.key size={16}/></div>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>{(home.accessKind || "ACCESS").toUpperCase()}</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>{home.accessDetail || <em style={{ color: "var(--ink-3)" }}>not set</em>}</div>
            </div>
          </div>
          <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <div style={{ color: "var(--ink-3)" }}><I.wifi size={16}/></div>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>WIFI</div>
              <div style={{ fontSize: 13, marginTop: 2 }} className="mono">{home.wifiNetwork || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">pwd: {home.wifiPassword || "—"}</div>
            </div>
          </div>
          <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <div style={{ color: "var(--ink-3)" }}><I.phone size={16}/></div>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em" }}>VET</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>{home.emergencyVet || <em style={{ color: "var(--ink-3)" }}>not set</em>}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{home.emergencyPhone}</div>
            </div>
          </div>
        </div>
        {home.notes && (
          <div style={{ marginTop: 18, padding: 14, background: "var(--bg-2)", borderRadius: 12, fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 10 }}>
            <I.note size={16}/>
            <div><strong>House notes:</strong> {home.notes}</div>
          </div>
        )}

        {/* Household members */}
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}>HOUSEHOLD MEMBERS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {residents.map(r => (
              <button key={r.id} onClick={() => setMemberModal(r)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", border: "1px solid var(--line)", borderRadius: 999, background: "var(--card)", cursor: "pointer", color: "inherit" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: r.isPrimary ? "var(--green)" : "var(--brown)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>
                  {r.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {r.name}
                  {r.id === user.id && <span style={{ color: "var(--ink-3)", fontWeight: 500 }}> (you)</span>}
                </div>
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={onEditHome}>
              <I.plus size={14}/> Add member
            </button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      {invoices && invoices.length > 0 && <UserInvoicesSection invoices={invoices} pricing={pricing} onOpen={(inv) => setInvoiceModal(inv)}/>}

      {/* Pets grid */}
      <div className="section" id="section-pets">        <h2>Pets in your home <span className="count">{pets.length}</span></h2>
        <div className="pet-grid">
          {pets.map(p => {
            const age = window.computeAge(p.birthday);
            return (
              <div key={p.id} className="pet-card" onClick={() => onOpenPet(p.id)}>
                <div className="photo">
                  <PetPhoto pet={p} />
                  <span className="badge-tl">{p.species}</span>
                  {p.meds?.length > 0 && (
                    <span className="badge-tr"><I.pill size={11}/> {p.meds.length}</span>
                  )}
                </div>
                <div className="body">
                  <div className="between">
                    <div className="name">{p.name}</div>
                    <div style={{ color: "var(--ink-3)", fontSize: 12 }}>{age || "—"}</div>
                  </div>
                  <div className="meta">{p.breed} · {p.sex} · {p.weight ? `${p.weight} ${p.weightUnit || "lb"}` : "—"}</div>
                  <div className="tags">
                    {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
          <button className="add-pet" onClick={onAddPet}>
            <div className="plus"><I.plus size={20}/></div>
            <div>Add a pet</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Photos, meds, care notes</div>
          </button>
        </div>
      </div>

      {medsModal && <AllMedsModal pets={pets} onClose={() => setMedsModal(false)} onOpenPet={onOpenPet} onUpdatePet={(updated) => window.__updatePet?.(updated)} toast={toast}/>}

      {householdModal && (
        <Modal
          size="lg"
          title="Household members"
          subtitle={`${residents.length} member${residents.length === 1 ? "" : "s"} at ${home.name}`}
          onClose={() => setHouseholdModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => { setHouseholdModal(false); onEditHome(); }}>
              <I.plus size={14}/> Invite member
            </button>
            <button className="btn btn-primary" onClick={() => setHouseholdModal(false)}>Close</button>
          </>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {residents.map(r => (
              <button key={r.id} onClick={() => { setHouseholdModal(false); setMemberModal(r); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: "1px solid var(--line)", borderRadius: 12, background: "var(--card)", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: r.isPrimary ? "var(--green)" : "var(--brown)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {r.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 15 }}>{r.name}</strong>
                    {r.id === user.id && <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 500 }}>(you)</span>}
                    {r.isPrimary && <span style={{ fontSize: 9, fontWeight: 800, color: "var(--green-deep)", background: "#E6F0E1", padding: "2px 6px", borderRadius: 999, letterSpacing: "0.04em" }}>PRIMARY</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{r.email}{r.phone ? ` · ${r.phone}` : ""}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>View →</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {memberModal && (
        <HouseholdMemberModal
          member={memberModal}
          currentUser={user}
          isPrimaryViewer={residents.find(r => r.id === user.id)?.isPrimary === true}
          onClose={() => setMemberModal(null)}
          onSave={(updated) => {
            window.__updateMember?.(updated);
            setMemberModal(null);
            toast(`${updated.name} updated`);
          }}
          onRemove={() => {
            window.__removeMember?.(memberModal.id);
            setMemberModal(null);
            toast(`${memberModal.name} removed from this home`);
          }}
        />
      )}

      {invoiceModal && (
        <UserInvoiceDetail
          invoice={invoiceModal}
          pricing={pricing}
          home={home}
          sittingDates={(() => {
            const a = appointments.find(x => x.id === invoiceModal.apptId);
            return a ? `${window.fmtDateShort(a.start)} – ${window.fmtDateShort(a.end)}` : null;
          })()}
          onClose={() => setInvoiceModal(null)}
          onPay={() => { toast("Opening payment…"); setInvoiceModal(null); }}
          toast={toast}
        />
      )}
    </div>
  );
}

function AllMedsModal({ pets, onClose, onOpenPet, onUpdatePet, toast }) {
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const byPet = pets.filter(p => (p.meds || []).length > 0);

  const startEdit = (pet, med) => {
    setEditingId(med.id);
    setEditForm({ petId: pet.id, ...med });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = () => {
    const pet = pets.find(p => p.id === editForm.petId);
    if (!pet) return;
    const meds = pet.meds.map(m => m.id === editForm.id ? { ...m, name: editForm.name, dose: editForm.dose, freq: editForm.freq, color: editForm.color } : m);
    onUpdatePet({ ...pet, meds });
    cancelEdit();
    toast?.("Medication updated");
  };
  const removeMed = (pet, medId) => {
    onUpdatePet({ ...pet, meds: pet.meds.filter(m => m.id !== medId) });
    cancelEdit();
    toast?.("Medication removed");
  };

  return (
    <Modal
      size="lg"
      title="All medications across your pets"
      subtitle={`${byPet.reduce((n, p) => n + p.meds.length, 0)} medications across ${byPet.length} pet${byPet.length === 1 ? "" : "s"}`}
      onClose={onClose}
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}
    >
      {byPet.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "var(--ink-3)" }}>
          <I.pill size={32}/>
          <div style={{ marginTop: 8, fontWeight: 600 }}>No medications on file</div>
        </div>
      ) : byPet.map(p => (
        <div key={p.id}>
          <div className="row" style={{ marginBottom: 8, justifyContent: "space-between" }}>
            <button onClick={() => { onClose(); onOpenPet(p.id); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--brown)", fontSize: 12 }}>{p.name[0]}</div>
              <strong style={{ fontSize: 14 }}>{p.name}</strong>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>· {p.species}</span>
            </button>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>Click any to edit</span>
          </div>
          <div className="med-list" style={{ marginBottom: 14 }}>
            {p.meds.map(m => (
              editingId === m.id ? (
                <div key={m.id} className="med-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <div className="field"><label>Name</label><input className="input" value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}/></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div className="field"><label>Dose</label><input className="input" value={editForm.dose || ""} onChange={e => setEditForm(f => ({ ...f, dose: e.target.value }))}/></div>
                    <div className="field"><label>Frequency</label><input className="input" value={editForm.freq || ""} onChange={e => setEditForm(f => ({ ...f, freq: e.target.value }))}/></div>
                  </div>
                  <div className="field">
                    <label>Category color</label>
                    <div className="row" style={{ gap: 8 }}>
                      {[["amber","#E8A33D"],["green","#3A6B33"],["purple","#6B3FA0"],["red","#D94545"]].map(([k, c]) => (
                        <button key={k} onClick={() => setEditForm(f => ({ ...f, color: k }))} style={{
                          width: 28, height: 28, borderRadius: 8,
                          border: editForm.color === k ? "2.5px solid var(--ink)" : "2.5px solid transparent",
                          background: c, cursor: "pointer", padding: 0,
                        }}/>
                      ))}
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => removeMed(p, m.id)}><I.trash size={13}/> Remove</button>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                      <button className="btn btn-green btn-sm" onClick={saveEdit}><I.check size={13}/> Save</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button key={m.id} className="med-item" onClick={() => startEdit(p, m)} style={{ textAlign: "left", cursor: "pointer", width: "100%" }}>
                  <div className={"pill-icon " + (m.color || "")}><I.pill size={18}/></div>
                  <div className="info">
                    <div className="t">{m.name} <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>· {m.dose}</span></div>
                    <div className="d">{m.freq}</div>
                  </div>
                  <I.edit size={14} style={{ color: "var(--ink-3)" }}/>
                </button>
              )
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

window.UserHomeScreen = UserHomeScreen;
