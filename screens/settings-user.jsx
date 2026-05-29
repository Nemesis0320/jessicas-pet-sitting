// User Settings — Appearance, Account, Notifications
function UserSettings({ user, home, tweaks, setTweak, onEditProfile, onChangePassword, toast }) {
  const [section, setSection] = React.useState("appearance");

  const sections = {
    appearance: <AppearancePanel tweaks={tweaks} setTweak={setTweak}/>,
    account: <AccountPanel user={user} home={home} onEditProfile={onEditProfile} onChangePassword={onChangePassword}/>,
    notifications: <NotificationsPanel toast={toast}/>,
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">your preferences —</div>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-nav">
          <button className={section === "appearance" ? "active" : ""} onClick={() => setSection("appearance")}>Appearance</button>
          <button className={section === "account" ? "active" : ""} onClick={() => setSection("account")}>Account & security</button>
          <button className={section === "notifications" ? "active" : ""} onClick={() => setSection("notifications")}>Notifications</button>
        </div>
        <div className="card card-pad">{sections[section]}</div>
      </div>
    </div>
  );
}

// Shared Appearance panel — used by both user & admin settings
function AppearancePanel({ tweaks, setTweak }) {
  const themes = [
    { id: "default",   name: "Warm",           sub: "The original",          swatches: ["#FBF6EC", "#4A2C1A", "#3A6B33"] },
    { id: "forest",    name: "Forest",         sub: "Earthy & calm",         swatches: ["#F4F1E6", "#5A4225", "#4A6B2A"] },
    { id: "coastal",   name: "Coastal",        sub: "Sand & sea",            swatches: ["#FAF4E8", "#C66E5C", "#2A8C8F"] },
    { id: "lavender",  name: "Lavender",       sub: "Soft & pastel",         swatches: ["#F4ECF7", "#6B3FA0", "#B85EA8"] },
    { id: "frutiger",  name: "Frutiger Aero",  sub: "Glossy & nostalgic",    swatches: ["#5BB9F0", "#0A6FB8", "#2BB673"], gradient: true },
    { id: "slate",     name: "Slate",          sub: "Dark & professional",   swatches: ["#0F141C", "#3B82F6", "#F1F5F9"], dark: true },
    { id: "bg3",       name: "By The River",  sub: "Parchment & candle",   swatches: ["#1A0F08", "#D89B3C", "#8B1A1A"], dark: true, easter: true },
    { id: "lcars",     name: "LCARS",          sub: "Starship bridge",       swatches: ["#000000", "#FF9900", "#CC99CC"], dark: true, easter: true },
    { id: "neon",      name: "Neon Cyberpunk", sub: "Bold & glowing",        swatches: ["#0A0418", "#FF1493", "#00FFC8"], dark: true, neon: true, easter: true },
  ];

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Theme</h2>
      <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 16 }}>
        Pick a look. Changes apply instantly and persist between visits.
      </div>

      <div className="theme-grid" style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setTweak("theme", t.id)}
            style={{
              padding: 14,
              borderRadius: 14,
              border: tweaks.theme === t.id ? "2.5px solid var(--brown)" : "1.5px solid var(--line)",
              background: "var(--card)",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform .12s ease, box-shadow .12s ease",
              transform: tweaks.theme === t.id ? "translateY(-2px)" : "none",
              boxShadow: tweaks.theme === t.id ? "0 8px 20px color-mix(in oklab, var(--brown) 15%, transparent)" : "none",
            }}
          >
            <div style={{
              height: 60,
              borderRadius: 10,
              marginBottom: 10,
              background: t.gradient
                ? `linear-gradient(180deg, ${t.swatches[0]} 0%, ${t.swatches[1]} 100%)`
                : t.swatches[0],
              position: "relative",
              overflow: "hidden",
              border: t.dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
              boxShadow: t.neon ? `inset 0 0 30px ${t.swatches[1]}55` : "none",
            }}>
              {/* Mini "cards" preview */}
              <div style={{
                position: "absolute",
                left: 10, top: 10,
                width: 38, height: 12, borderRadius: 4,
                background: t.dark ? "rgba(255,255,255,0.85)" : t.swatches[1],
                boxShadow: t.neon ? `0 0 8px ${t.swatches[1]}` : "none",
              }}/>
              <div style={{
                position: "absolute",
                left: 10, top: 28,
                width: 70, height: 6, borderRadius: 3,
                background: t.dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.15)",
              }}/>
              {/* Accent dot */}
              <div style={{
                position: "absolute",
                right: 10, bottom: 10,
                width: 14, height: 14, borderRadius: "50%",
                background: t.swatches[2],
                boxShadow: t.neon ? `0 0 10px ${t.swatches[2]}` : "none",
              }}/>
              {tweaks.theme === t.id && (
                <div style={{
                  position: "absolute",
                  top: 4, right: 4,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--brown)",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                }}>✓</div>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              {t.name}
              {t.easter && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999, background: "rgba(216, 155, 60, 0.2)", color: "#7A5615", fontWeight: 800, letterSpacing: "0.05em" }}>EASTER EGG</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{t.sub}</div>
          </button>
        ))}
      </div>

      <h2>Panel style</h2>
      <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 14 }}>How cards and panels are rendered. All styles work with any theme.</div>
      <div className="panels-grid" style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {[
          { id: "solid",     name: "Solid",     sub: "Classic flat",         render: <PanelPreview kind="solid"/> },
          { id: "glass",     name: "Glass",     sub: "Frosted & blurred",    render: <PanelPreview kind="glass"/> },
          { id: "soft",      name: "Soft",      sub: "Neumorphic emboss",    render: <PanelPreview kind="soft"/> },
          { id: "outlined",  name: "Outlined",  sub: "Bold borders, no fill",render: <PanelPreview kind="outlined"/> },
          { id: "floating",  name: "Floating",  sub: "Heavy lift shadow",    render: <PanelPreview kind="floating"/> },
          { id: "paper",     name: "Paper",     sub: "Subtle grain texture", render: <PanelPreview kind="paper"/> },
          { id: "brutal",    name: "Brutalist", sub: "Thick borders, offset",render: <PanelPreview kind="brutal"/> },
          { id: "sticker",   name: "Sticker",   sub: "Tilted polaroid feel", render: <PanelPreview kind="sticker"/> },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setTweak("panels", p.id)}
            style={{
              padding: 12, borderRadius: 14,
              border: (tweaks.panels || "solid") === p.id ? "2.5px solid var(--brown)" : "1.5px solid var(--line)",
              background: "var(--card)", cursor: "pointer", textAlign: "left",
            }}
          >
            {p.render}
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.sub}</div>
          </button>
        ))}
      </div>

      <h2>Typography</h2>
      <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 14 }}>Choose a font family and base text size.</div>
      <div className="typography-grid" style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {[
          { id: "sans",    name: "Sans",    family: "'Plus Jakarta Sans', sans-serif", sample: "Aa" },
          { id: "serif",   name: "Serif",   family: "'Lora', Georgia, serif",          sample: "Aa" },
          { id: "rounded", name: "Rounded", family: "'Quicksand', sans-serif",         sample: "Aa" },
          { id: "mono",    name: "Mono",    family: "ui-monospace, monospace",         sample: "Aa" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setTweak("font", f.id)}
            style={{
              padding: 14, borderRadius: 14,
              border: (tweaks.font || "sans") === f.id ? "2.5px solid var(--brown)" : "1.5px solid var(--line)",
              background: "var(--card)", cursor: "pointer", textAlign: "center",
              fontFamily: f.family,
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: "var(--ink)" }}>{f.sample}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, fontFamily: f.family }}>{f.name}</div>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 6 }}>Text size</label>
        <div style={{ display: "flex", gap: 6, background: "var(--bg-2)", padding: 4, borderRadius: 12 }}>
          {[
            { id: "md",  label: "Default"  },
            { id: "lg",  label: "Large"    },
            { id: "xl",  label: "X-Large"  },
            { id: "xxl", label: "XX-Large" },
          ].map(s => (
            <button key={s.id}
              onClick={() => setTweak("textSize", s.id)}
              style={{
                flex: 1, padding: "8px 12px", border: "none", borderRadius: 9,
                background: (tweaks.textSize || "md") === s.id ? "var(--card)" : "transparent",
                color: (tweaks.textSize || "md") === s.id ? "var(--ink)" : "var(--ink-3)",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                boxShadow: (tweaks.textSize || "md") === s.id ? "var(--shadow-sm)" : "none",
              }}>{s.label}</button>
          ))}
        </div>
      </div>

      <h2>Accessibility</h2>
      <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 14 }}>Make the app easier to see, read, and use. Combine freely.</div>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="contrast"      label="High contrast"            desc="Boost ink and border contrast across the app."/>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="reduceMotion"  label="Reduce motion"            desc="Disable animations and transitions."/>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="focus"         label="Show focus indicators"    desc="A bright outline appears around the focused element."/>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="dyslexia"      label="Dyslexia-friendly font"    desc="Switches to Verdana with extra letter and word spacing."/>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="underline"     label="Underline all links"      desc="Don't rely on color alone to mark links."/>
      <A11ySwitch tweaks={tweaks} setTweak={setTweak} keyName="colorBlind"    label="Color-blind cues"         desc="Add labels and shapes where color is the only signal."/>

      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-2)", fontWeight: 600, padding: 8 }}>Advanced</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          <div className="settings-row" style={{ borderTop: "none", paddingTop: 0 }}>
            <div><div className="label">Card corner radius</div><div className="desc">How rounded panels and cards are.</div></div>
            <input type="range" min="0" max="32" step="1" value={tweaks.cardRadius} onChange={e => setTweak("cardRadius", Number(e.target.value))} style={{ width: 140 }}/>
          </div>
        </div>
      </details>
    </>
  );
}

function AccountPanel({ user, home, onEditProfile, onChangePassword }) {
  const [deleteStep, setDeleteStep] = React.useState(0); // 0 = idle, 1 = confirm, 2 = type to confirm
  const [confirmText, setConfirmText] = React.useState("");
  const expectedText = "DELETE " + (user.name?.split(" ")[0] || "ACCOUNT").toUpperCase();

  const resetDelete = () => { setDeleteStep(0); setConfirmText(""); };

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Account</h2>
      <div className="settings-row">
        <div className="row" style={{ gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>{user.avatar}</div>
          <div>
            <div className="label">{user.name}</div>
            <div className="desc">{user.email}{user.phone ? ` · ${user.phone}` : ""}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onEditProfile}><I.edit size={14}/> Edit</button>
      </div>
      {home && (
        <div className="settings-row">
          <div><div className="label">Home</div><div className="desc">{home.name} · {home.address || "no address yet"}</div></div>
        </div>
      )}

      <h2>Security</h2>
      <div className="settings-row">
        <div><div className="label">Password</div><div className="desc">Last changed —</div></div>
        <button className="btn btn-outline btn-sm" onClick={onChangePassword}><I.key size={14}/> Change password</button>
      </div>
      <div className="settings-row">
        <div><div className="label">Sign out everywhere</div><div className="desc">End all sessions on all devices.</div></div>
        <button className="btn btn-outline btn-sm">Sign out all</button>
      </div>

      <h2 style={{ color: "var(--heart)" }}>Danger zone</h2>
      <div style={{ padding: 16, border: "1.5px solid #F2C7C7", background: "#FDF6F6", borderRadius: 12 }}>
        <div className="between" style={{ marginBottom: deleteStep > 0 ? 14 : 0 }}>
          <div>
            <div className="label" style={{ color: "var(--heart)" }}>Delete account</div>
            <div className="desc">Permanently remove your account, all pets, photos, notes, and history. This cannot be undone.</div>
          </div>
          {deleteStep === 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => setDeleteStep(1)}>I want to delete my account</button>
          )}
        </div>

        {deleteStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="alert" style={{ background: "#FBE0E0", color: "#6B1F1F", border: "1px solid #F2C7C7" }}>
              <div className="dot"/>
              <div>
                <strong>Are you absolutely sure?</strong> Deleting your account will:
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13 }}>
                  <li>Remove all pets, photos, daily checklists, medications, vaccines, and incident logs.</li>
                  <li>Cancel any upcoming sittings.</li>
                  <li>Remove your access to past invoices and records.</li>
                </ul>
                The admin team keeps a copy for legal/billing purposes for 90 days, after which everything is permanently deleted.
              </div>
            </div>
            <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={resetDelete}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteStep(2)}>Yes, I understand — continue</button>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
              To confirm, please type <strong style={{ fontFamily: "ui-monospace, monospace", color: "var(--heart)" }}>{expectedText}</strong> below.
            </div>
            <input className="input mono" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={expectedText} style={{ letterSpacing: "0.05em" }}/>
            <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={resetDelete}>Cancel</button>
              <button
                className="btn btn-danger btn-sm"
                disabled={confirmText !== expectedText}
                onClick={() => { alert("In production, this would log you out and queue deletion. For this demo, no action is taken."); resetDelete(); }}
                style={{ opacity: confirmText === expectedText ? 1 : 0.5 }}
              >
                Permanently delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function NotificationsPanel({ toast }) {
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [dailyDigest, setDailyDigest]   = React.useState(true);
  const [photoUpdates, setPhotoUpdates] = React.useState(true);
  const [sitterNotes, setSitterNotes]   = React.useState(true);

  const Switch = ({ value, onChange }) => (
    <button className={"switch " + (value ? "on" : "")} onClick={() => { onChange(!value); toast("Setting updated"); }}/>
  );

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Email notifications</h2>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>
        Everything is delivered via email. We'll always email you about incidents and invoices regardless of these settings.
      </div>
      <div className="settings-row">
        <div><div className="label">Sitting status updates</div><div className="desc">Emails when your sitting request is approved, declined, or modified.</div></div>
        <Switch value={emailUpdates} onChange={setEmailUpdates}/>
      </div>
      <div className="settings-row">
        <div>
          <div className="label">Daily digest during sittings</div>
          <div className="desc">One end-of-day summary email — only when a sitter is actively at your home. You won't get them on days without a sitting.</div>
        </div>
        <Switch value={dailyDigest} onChange={setDailyDigest}/>
      </div>
      <div className="settings-row">
        <div><div className="label">Sitter notes</div><div className="desc">Get an email each time a sitter posts a note about one of your pets.</div></div>
        <Switch value={sitterNotes} onChange={setSitterNotes}/>
      </div>
      <div className="settings-row">
        <div><div className="label">Photo updates</div><div className="desc">Get an email when a sitter uploads a new photo of your pet.</div></div>
        <Switch value={photoUpdates} onChange={setPhotoUpdates}/>
      </div>
      <div style={{ marginTop: 14, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-2)" }}>
        <strong>Always sent:</strong> Incident reports · Invoices · Password resets · Account changes.
      </div>
    </>
  );
}

Object.assign(window, { UserSettings, AppearancePanel, AccountPanel, NotificationsPanel });

// Small previews for each panel style
function PanelPreview({ kind }) {
  const base = {
    height: 56, borderRadius: 8, position: "relative",
  };
  const inner = (color = "#fff") => ({
    position: "absolute", left: 56, top: 14, width: 80, height: 8, borderRadius: 3, background: color, border: "1px solid rgba(0,0,0,0.08)"
  });
  const inner2 = (color = "#fff") => ({
    position: "absolute", left: 56, top: 28, width: 50, height: 6, borderRadius: 3, background: color, border: "1px solid rgba(0,0,0,0.08)"
  });
  const dot = (color = "#fff") => ({
    position: "absolute", left: 12, top: 10, width: 36, height: 36, borderRadius: 6, background: color, border: "1px solid rgba(0,0,0,0.08)"
  });

  if (kind === "solid") return (
    <div style={{ ...base, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
      <div style={dot("var(--card)")}/><div style={inner("var(--card)")}/><div style={inner2("var(--card)")}/>
    </div>
  );
  if (kind === "glass") return (
    <div style={{ ...base, backgroundImage: "linear-gradient(135deg, #87CEEB, #B6DEFE)", overflow: "hidden" }}>
      <div style={{ ...dot("rgba(255,255,255,0.55)"), boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}/>
      <div style={inner("rgba(255,255,255,0.55)")}/><div style={inner2("rgba(255,255,255,0.55)")}/>
    </div>
  );
  if (kind === "soft") return (
    <div style={{ ...base, background: "var(--bg-2)" }}>
      <div style={{ ...dot("var(--bg-2)"), border: "none", boxShadow: "3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.8)" }}/>
      <div style={{ ...inner("var(--bg-2)"), border: "none", boxShadow: "inset 2px 2px 3px rgba(0,0,0,0.08), inset -1px -1px 2px rgba(255,255,255,0.5)" }}/>
      <div style={{ ...inner2("var(--bg-2)"), border: "none", boxShadow: "inset 2px 2px 3px rgba(0,0,0,0.08), inset -1px -1px 2px rgba(255,255,255,0.5)" }}/>
    </div>
  );
  if (kind === "outlined") return (
    <div style={{ ...base, background: "transparent", border: "2px solid var(--ink)" }}>
      <div style={{ ...dot("transparent"), border: "2px solid var(--ink)" }}/>
      <div style={{ ...inner("transparent"), border: "2px solid var(--ink)" }}/>
      <div style={{ ...inner2("transparent"), border: "2px solid var(--ink)" }}/>
    </div>
  );
  if (kind === "floating") return (
    <div style={{ ...base, background: "var(--bg-2)", boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.06)" }}>
      <div style={{ ...dot("var(--card)"), boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}/>
      <div style={inner("var(--card)")}/><div style={inner2("var(--card)")}/>
    </div>
  );
  if (kind === "paper") return (
    <div style={{
      ...base,
      background: "var(--card)",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px), repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.02) 12px, rgba(0,0,0,0.02) 13px)",
      border: "1px solid rgba(0,0,0,0.12)",
    }}>
      <div style={{ ...dot("var(--bg-2)"), border: "1px solid rgba(0,0,0,0.1)" }}/>
      <div style={{ ...inner("var(--bg-2)"), border: "1px solid rgba(0,0,0,0.1)" }}/>
      <div style={{ ...inner2("var(--bg-2)"), border: "1px solid rgba(0,0,0,0.1)" }}/>
    </div>
  );
  if (kind === "brutal") return (
    <div style={{
      ...base,
      borderRadius: 2,
      background: "var(--card)",
      border: "3px solid var(--ink)",
      boxShadow: "4px 4px 0 0 var(--ink)",
    }}>
      <div style={{ ...dot("var(--card)"), borderRadius: 2, border: "2px solid var(--ink)" }}/>
      <div style={{ ...inner("var(--card)"), borderRadius: 1, border: "2px solid var(--ink)", height: 6 }}/>
      <div style={{ ...inner2("var(--card)"), borderRadius: 1, border: "2px solid var(--ink)", height: 4 }}/>
    </div>
  );
  if (kind === "sticker") return (
    <div style={{
      ...base,
      background: "var(--card)",
      border: "1px solid rgba(0,0,0,0.1)",
      transform: "rotate(-1deg)",
      boxShadow: "0 6px 14px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
    }}>
      <div style={dot("var(--bg-2)")}/>
      <div style={inner("var(--bg-2)")}/>
      <div style={inner2("var(--bg-2)")}/>
    </div>
  );
  return null;
}

window.PanelPreview = PanelPreview;

// A11y toggle row
function A11ySwitch({ tweaks, setTweak, keyName, label, desc }) {
  const a = tweaks.a11y || {};
  const value = !!a[keyName];
  const onChange = (v) => setTweak("a11y", { ...a, [keyName]: v });
  return (
    <div className="settings-row">
      <div><div className="label">{label}</div><div className="desc">{desc}</div></div>
      <button className={"switch " + (value ? "on" : "")} onClick={() => onChange(!value)}/>
    </div>
  );
}

window.A11ySwitch = A11ySwitch;
