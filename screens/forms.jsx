// Form modals: edit/add pet, edit home, invite homeowner, reset password
const { useState: useS } = React;

const SPECIES = ["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Fish", "Other"];

const COMMON_TAGS = {
  Dog: ["friendly", "shy", "high energy", "senior", "puppy", "loves walks", "fetch obsessed", "anxious", "leash puller", "good with kids", "good with cats", "afraid of thunder", "treat motivated", "knows tricks"],
  Cat: ["indoor only", "outdoor access", "lap cat", "shy", "talkative", "playful", "senior", "kitten", "anxious", "hunter", "lap warmer", "doesn't like to be picked up", "loves laser pointer"],
  default: ["friendly", "shy", "senior", "high energy", "anxious", "loves treats", "knows tricks", "needs daily exercise", "special diet"],
};

function PetForm({ pet, homeId, onClose, onSave, onDelete }) {
  const isEdit = !!pet;
  const [form, setForm] = useS(pet ? { ...pet, weight: pet.weight || "", weightUnit: pet.weightUnit || "lb" } : {
    name: "", species: "Dog", breed: "", birthday: "", weight: "", weightUnit: "lb", sex: "Female", color: "",
    home: homeId, photos: [], tags: [], meds: [], care: "", notes: [],
  });
  const [tagInput, setTagInput] = useS("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ageStr = window.computeAge(form.birthday);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setForm(f => ({ ...f, tags: [...(f.tags || []), t] }));
    setTagInput("");
  };

  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const out = { ...form, weight: form.weight === "" ? null : Number(form.weight) };
    if (!isEdit) out.id = "pet-" + Date.now();
    onSave(out);
  };

  return (
    <Modal
      size="lg"
      title={isEdit ? `Edit ${pet.name}` : "Add a pet"}
      subtitle={isEdit ? "Update your pet's profile" : "Tell us a bit about your pet — you can add photos & meds after."}
      onClose={onClose}
      footer={<>
        {isEdit && onDelete && (
          <button className="btn btn-danger" style={{ marginRight: "auto" }} onClick={onDelete}><I.trash size={14}/> Remove pet</button>
        )}
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{isEdit ? "Save changes" : "Add pet"}</button>
      </>}
    >
      <div className="form-section">Identity</div>
      <div className="field"><label>Name</label><input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Biscuit" autoFocus/></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
        <div className="field">
          <label>Species</label>
          <select className="select" value={form.species} onChange={e => set("species", e.target.value)}>
            {SPECIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Breed</label><input className="input" value={form.breed} onChange={e => set("breed", e.target.value)} placeholder="e.g. Beagle"/></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Sex</label>
          <select className="select" value={form.sex} onChange={e => set("sex", e.target.value)}>
            <option>Female</option><option>Male</option><option>Unknown</option>
          </select>
        </div>
        <div className="field"><label>Color / markings</label><input className="input" value={form.color} onChange={e => set("color", e.target.value)} placeholder="e.g. Tri-color"/></div>
      </div>

      <div className="form-section">Age & weight</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Birthday <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional)</span></label>
          <input className="input" type="date" value={form.birthday || ""} onChange={e => set("birthday", e.target.value)}/>
          {ageStr && <div style={{ fontSize: 12, color: "var(--green-deep)", marginTop: 4, fontWeight: 600 }}>Age: {ageStr} <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(auto-updates)</span></div>}
        </div>
        <div className="field">
          <label>Weight</label>
          <div className="input-row">
            <input className="input" type="number" min="0" step="0.1" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="—"/>
            <select className="select" value={form.weightUnit} onChange={e => set("weightUnit", e.target.value)}>
              <option>lb</option><option>kg</option><option>oz</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">Personality</div>
      <div className="field">
        <label>Common tags <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(click to toggle)</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(COMMON_TAGS[form.species] || COMMON_TAGS.default).map(t => {
            const on = (form.tags || []).includes(t);
            return (
              <button key={t} onClick={() => {
                setForm(f => ({
                  ...f,
                  tags: on ? f.tags.filter(x => x !== t) : [...(f.tags || []), t]
                }));
              }} style={{
                fontSize: 12, fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 999,
                border: on ? "1.5px solid var(--brown)" : "1.5px solid var(--line)",
                background: on ? "var(--brown)" : "var(--card)",
                color: on ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                {on && <I.check size={11}/>} {t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="field">
        <label>Custom tag</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add your own…"/>
          <button className="btn btn-outline btn-sm" onClick={addTag}>Add</button>
        </div>
        {form.tags?.filter(t => !(COMMON_TAGS[form.species] || COMMON_TAGS.default).includes(t)).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {form.tags.filter(t => !(COMMON_TAGS[form.species] || COMMON_TAGS.default).includes(t)).map(t => (
              <span key={t} className="tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {t}
                <button onClick={() => removeTag(t)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", color: "var(--ink-3)", display: "flex" }}><I.x size={12}/></button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="field"><label>Care notes <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional)</span></label><textarea className="textarea" value={form.care} onChange={e => set("care", e.target.value)} rows={3} placeholder="Feeding schedule, walk routine, quirks…"/></div>
    </Modal>
  );
}

function HomeForm({ home, allUsers, onClose, onSave, onAddResident, onRemoveResident }) {
  const [form, setForm] = useS({ ...home });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const residents = (form.residents || []).map(uid => allUsers?.[uid]).filter(Boolean);

  return (
    <Modal
      size="lg"
      title="Edit home details"
      subtitle="What sitters need to know to take great care."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Save changes</button>
      </>}
    >
      <div className="form-section">Home</div>
      <div className="field"><label>Home name</label><input className="input" value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="e.g. The Chen Residence"/></div>
      <div className="field"><label>Street address</label><input className="input" value={form.address || ""} onChange={e => set("address", e.target.value)}/></div>

      <div className="form-section">Access</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div className="field">
          <label>Access type</label>
          <select className="select" value={form.accessKind || "Lockbox"} onChange={e => set("accessKind", e.target.value)}>
            <option>Lockbox</option>
            <option>Keypad</option>
            <option>Garage code</option>
            <option>Doorman</option>
            <option>Hidden key</option>
            <option>Sitter has key</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field"><label>Details (code, location, etc.)</label><input className="input" value={form.accessDetail || ""} onChange={e => set("accessDetail", e.target.value)} placeholder="e.g. Code 4821, mounted by front door"/></div>
      </div>

      <div className="form-section">WiFi</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Network name (SSID)</label><input className="input" value={form.wifiNetwork || ""} onChange={e => set("wifiNetwork", e.target.value)} placeholder="ChenHome"/></div>
        <div className="field"><label>Password</label><input className="input" value={form.wifiPassword || ""} onChange={e => set("wifiPassword", e.target.value)} placeholder="••••••••"/></div>
      </div>

      <div className="form-section">Emergency vet</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
        <div className="field"><label>Vet / clinic</label><input className="input" value={form.emergencyVet || ""} onChange={e => set("emergencyVet", e.target.value)} placeholder="Maplewood Veterinary"/></div>
        <div className="field"><label>Phone</label><input className="input" type="tel" value={form.emergencyPhone || ""} onChange={e => set("emergencyPhone", e.target.value)} placeholder="(555) 555-0900"/></div>
      </div>

      <div className="form-section">House notes</div>
      <div className="field"><label>Anything else sitters should know</label><textarea className="textarea" value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Plants to water, mail, alarm codes, neighbors…"/></div>

      {onAddResident && (
        <>
          <div className="form-section">Household members</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: -4, marginBottom: 4 }}>People who live here and can manage this home. Everyone sees the same pets, notes, and appointments.</div>
          {residents.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--card)" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: r.isPrimary ? "var(--green)" : "var(--brown)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                {r.name.split(" ").map(w => w[0]).join("").slice(0,2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name} {r.isPrimary && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-deep)", background: "#E6F0E1", padding: "2px 6px", borderRadius: 999, marginLeft: 4 }}>PRIMARY</span>}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.email}</div>
              </div>
              {!r.isPrimary && onRemoveResident && (
                <button className="btn btn-ghost btn-sm" onClick={() => onRemoveResident(r.id)} title="Remove resident"><I.x size={14}/></button>
              )}
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={onAddResident} style={{ alignSelf: "flex-start" }}>
            <I.plus size={14}/> Add a household member
          </button>
        </>
      )}
    </Modal>
  );
}

function AddResidentModal({ onClose, onAdd }) {
  const [name, setName] = useS("");
  const [email, setEmail] = useS("");
  const [phone, setPhone] = useS("");
  return (
    <Modal
      title="Invite a household member"
      subtitle="They'll get an email to claim their account and join this home."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => name && email && onAdd({ name, email, phone })}>Send invite</button>
      </>}
    >
      <div className="field"><label>Name</label><input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. David Chen"/></div>
      <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com"/></div>
      <div className="field"><label>Phone <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional)</span></label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-0100"/></div>
    </Modal>
  );
}

function InviteHomeownerModal({ onClose, onInvite }) {
  const [step, setStep] = useS(1);
  const [form, setForm] = useS({
    ownerName: "", ownerEmail: "", phone: "", homeName: "", address: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext1 = form.ownerName && form.ownerEmail;
  const canFinish = form.homeName && form.address;

  const finish = () => {
    const uid = "u-" + Date.now();
    const hid = "home-" + Date.now();
    onInvite({
      home: {
        id: hid,
        name: form.homeName,
        address: form.address,
        residents: [uid],
        wifiNetwork: "", wifiPassword: "",
        accessKind: "Lockbox", accessDetail: "",
        emergencyVet: "", emergencyPhone: "",
        notes: "",
        pets: [],
        status: "onboarding",
      },
      user: { id: uid, name: form.ownerName, email: form.ownerEmail, phone: form.phone, homeId: hid, isPrimary: true },
    });
  };

  return (
    <Modal
      title="Invite a new homeowner"
      subtitle={`Step ${step} of 2 — ${step === 1 ? "owner info" : "home details"}`}
      onClose={onClose}
      footer={<>
        {step === 1 ? (
          <>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!canNext1} onClick={() => setStep(2)} style={{ opacity: canNext1 ? 1 : 0.5 }}>Next →</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" disabled={!canFinish} onClick={finish} style={{ opacity: canFinish ? 1 : 0.5 }}>Send invite</button>
          </>
        )}
      </>}
    >
      {step === 1 ? (
        <>
          <div className="field"><label>Owner's name</label><input className="input" autoFocus value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="e.g. Sarah Chen"/></div>
          <div className="field"><label>Email</label><input className="input" type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)} placeholder="name@email.com"/></div>
          <div className="field"><label>Phone <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(optional)</span></label><input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-0100"/></div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", background: "var(--bg-2)", padding: 10, borderRadius: 10 }}>
            They'll receive an email to claim their account, set a password, and add their pets.
          </div>
        </>
      ) : (
        <>
          <div className="field"><label>Home name</label><input className="input" autoFocus value={form.homeName} onChange={e => set("homeName", e.target.value)} placeholder="The Chen Residence"/></div>
          <div className="field"><label>Address</label><input className="input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="412 Maple Grove Ln, Portland OR"/></div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", background: "var(--bg-2)", padding: 10, borderRadius: 10 }}>
            The owner will fill in access codes, vet info, and house notes when they log in.
          </div>
        </>
      )}
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose, onConfirm }) {
  return (
    <Modal
      title={`Reset password for ${user.name}`}
      subtitle="They'll be prompted to set a new password at their next sign-in."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onConfirm}><I.key size={14}/> Send reset</button>
      </>}
    >
      <div className="alert" style={{ background: "#FCEFD3", color: "#7A5615", border: "1px solid #E8D9A8" }}>
        <div className="dot" style={{ background: "#E8A33D" }}/>
        <div>The current password will stop working immediately. {user.email && <>An email will be sent to <strong>{user.email}</strong>.</>}</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
        Use this when the user is locked out, suspects their account was compromised, or simply asks for help.
      </div>
    </Modal>
  );
}

// Edit my own profile (logged-in user)
function ProfileModal({ user, home, onClose, onSave }) {
  const [form, setForm] = useS({ name: user.name, email: user.email, phone: user.phone || "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal
      title="Your profile"
      subtitle="How you appear to admins and other household members."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Save profile</button>
      </>}
    >
      <div className="field"><label>Display name</label><input className="input" value={form.name} onChange={e => set("name", e.target.value)} autoFocus/></div>
      <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)}/></div>
      <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-0100"/></div>
      {home && (
        <div style={{ marginTop: 4, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 13, color: "var(--ink-2)" }}>
          You're a member of <strong>{home.name}</strong>. To change home details, use <em>Edit home</em> on the dashboard.
        </div>
      )}
      <details style={{ marginTop: 4 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>Change password</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          <input className="input" type="password" placeholder="Current password"/>
          <input className="input" type="password" placeholder="New password"/>
          <input className="input" type="password" placeholder="Confirm new password"/>
        </div>
      </details>
    </Modal>
  );
}

Object.assign(window, { PetForm, HomeForm, AddResidentModal, InviteHomeownerModal, ResetPasswordModal, ProfileModal, HouseholdMemberModal });

// View / edit a household member
function HouseholdMemberModal({ member, currentUser, isPrimaryViewer, onClose, onSave, onRemove }) {
  // Editable if: it's you, or you're the primary viewer.
  const isMe = member.id === currentUser.id;
  const canEdit = isMe || isPrimaryViewer;
  const canRemove = isPrimaryViewer && !member.isPrimary;

  const [form, setForm] = useS({ name: member.name, email: member.email, phone: member.phone || "" });
  const [editing, setEditing] = useS(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal
      title={editing ? `Edit ${member.name}` : member.name}
      subtitle={member.isPrimary ? "Primary household member" : "Household member"}
      onClose={onClose}
      footer={editing ? <>
        <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave({ ...member, ...form }); setEditing(false); }}>Save changes</button>
      </> : <>
        {canRemove && <button className="btn btn-danger" style={{ marginRight: "auto" }} onClick={onRemove}><I.trash size={14}/> Remove from home</button>}
        {canEdit && <button className="btn btn-outline" onClick={() => setEditing(true)}><I.edit size={14}/> Edit</button>}
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: "var(--bg-2)", borderRadius: 12, marginBottom: 4 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: member.isPrimary ? "var(--green)" : "var(--brown)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 20,
        }}>
          {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{member.name}{isMe && <span style={{ color: "var(--ink-3)", fontWeight: 500 }}> (you)</span>}</div>
          {member.isPrimary && <span style={{ fontSize: 10, fontWeight: 800, color: "var(--green-deep)", background: "#E6F0E1", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>PRIMARY</span>}
        </div>
      </div>

      {editing ? (
        <>
          <div className="field"><label>Display name</label><input className="input" value={form.name} onChange={e => set("name", e.target.value)} autoFocus/></div>
          <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)}/></div>
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 555-0100"/></div>
        </>
      ) : (
        <dl className="kv" style={{ gridTemplateColumns: "90px 1fr", marginTop: 4 }}>
          <dt>Email</dt><dd>{member.email}</dd>
          <dt>Phone</dt><dd>{member.phone || <em style={{ color: "var(--ink-3)", fontWeight: 500 }}>not set</em>}</dd>
          <dt>Role</dt><dd>{member.isPrimary ? "Primary household contact" : "Household member"}</dd>
        </dl>
      )}

      {!canEdit && !editing && (
        <div style={{ fontSize: 12, color: "var(--ink-3)", padding: 10, background: "var(--bg-2)", borderRadius: 10, marginTop: 4 }}>
          Only the primary household member or this person themselves can edit these details.
        </div>
      )}
    </Modal>
  );
}
