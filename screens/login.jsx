// Login + signup + reset prompt
function LoginScreen({ onLogin, onSignup, onForgotPassword }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // Sign-up state
  const [signupStep, setSignupStep] = useState(1); // 1 = info, 2 = verify, 3 = done
  const [name, setName] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");

  // Prefill demo creds on role change (sign-in only)
  useEffect(() => {
    if (mode !== "signin") return;
    if (role === "user") { setEmail("sarah.chen@email.com"); setPwd("biscuit2024"); }
    else { setEmail("jessica@jessicaspetsitting.com"); setPwd("admin"); }
  }, [role, mode]);

  const handleSubmit = e => {
    e.preventDefault();
    onLogin(role, email);
  };

  const startVerification = () => {
    setSignupError("");
    if (!name || !email || pwd.length < 8 || pwd !== pwd2) return;
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(c);
    setSignupStep(2);
  };

  const verify = () => {
    if (code === sentCode) {
      // Attempt to create the account — onSignup may return { ok, reason }
      const result = onSignup({ name, email });
      if (result && result.ok === false) {
        // Duplicate email or similar — drop back to step 1 with error
        setSignupError(
          result.reason === "duplicate"
            ? "An account already exists for this email. Try signing in, or use 'Forgot password' if you've lost access."
            : "Sign-up failed. Please try again."
        );
        setSignupStep(1);
        setCode("");
        return;
      }
      setSignupStep(3);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-art">
        <svg className="paws" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }).map((_, i) => {
            const x = ((i * 137) % 580) + 10;
            const y = ((i * 211) % 760) + 20;
            const rot = (i * 47) % 360;
            const op = 0.08 + ((i % 4) * 0.03);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.6 + (i%3)*0.2})`} fill="#4A2C1A" opacity={op}>
                <circle cx="0" cy="0" r="5"/>
                <circle cx="-9" cy="-9" r="3.5"/>
                <circle cx="9" cy="-9" r="3.5"/>
                <circle cx="-14" cy="2" r="3.2"/>
                <circle cx="14" cy="2" r="3.2"/>
              </g>
            );
          })}
        </svg>
        <img src="assets/logo.jpg" alt="Jessica's Pet Sitting" className="logo" />
      </div>

      <div className="login-form">
        <div className="login-card">
          {/* Sign in vs sign up tabs */}
          <div style={{ display: "inline-flex", padding: 4, background: "var(--bg-2)", borderRadius: 12, marginBottom: 18 }}>
            <button onClick={() => setMode("signin")} style={{ background: mode === "signin" ? "#fff" : "transparent", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, color: mode === "signin" ? "var(--ink)" : "var(--ink-3)", cursor: "pointer", boxShadow: mode === "signin" ? "var(--shadow-sm)" : "none" }}>Sign in</button>
            <button onClick={() => setMode("signup")} style={{ background: mode === "signup" ? "#fff" : "transparent", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, color: mode === "signup" ? "var(--ink)" : "var(--ink-3)", cursor: "pointer", boxShadow: mode === "signup" ? "var(--shadow-sm)" : "none" }}>Create account</button>
          </div>

          {mode === "signin" ? (
            <>
              <div className="hello-line" style={{ color: "var(--green)", fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 24, lineHeight: 1, marginBottom: 6 }}>welcome back —</div>
              <h1>Sign in</h1>
              <div className="sub">Manage your pets and home, or sign in as an admin.</div>

              <div className="role-toggle" data-role={role}>
                <div className="slider"/>
                <button className={role === "user" ? "active" : ""} onClick={() => setRole("user")}>
                  <I.paw size={14}/> &nbsp; Pet parent
                </button>
                <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>
                  <I.shield size={14}/> &nbsp; Admin
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Email</label>
                  <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
                </div>
                <div className="field" style={{ marginBottom: 18 }}>
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••"/>
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: "absolute", right: 10, top: 10, background: "transparent", border: "none", color: "var(--ink-3)", padding: 4 }}>
                      <I.eye size={16}/>
                    </button>
                  </div>
                </div>

                <button type="submit" className={"btn btn-block btn-lg " + (role === "admin" ? "btn-purple" : "btn-primary")}>
                  Sign in as {role === "user" ? "pet parent" : "admin"}
                </button>
              </form>

              <div className="tiny-hint">
                <a href="#" onClick={e => { e.preventDefault(); setShowForgot(true); }} style={{ color: "var(--brown)", fontWeight: 700 }}>Forgot password</a>
              </div>
            </>
          ) : (
            <SignupFlow
              step={signupStep}
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              pwd={pwd} setPwd={setPwd}
              pwd2={pwd2} setPwd2={setPwd2}
              code={code} setCode={setCode}
              sentCode={sentCode}
              error={signupError}
              onContinue={startVerification}
              onVerify={verify}
              onResend={() => { const c = String(Math.floor(100000 + Math.random() * 900000)); setSentCode(c); }}
              onBack={() => setSignupStep(1)}
              onSwitchToSignIn={() => { setMode("signin"); setSignupError(""); }}
            />
          )}
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} onSubmit={onForgotPassword}/>}
    </div>
  );
}

function ForgotPasswordModal({ onClose, onSubmit }) {
  const [emailInput, setEmailInput] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!emailInput.trim()) return;
    onSubmit?.(emailInput.trim());
    setSent(true);
  };

  return (
    <Modal
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={sent
        ? "If an account exists for that email, we sent instructions."
        : "Enter the email you signed up with. We'll send reset instructions."}
      onClose={onClose}
      footer={sent ? (
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      ) : (
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!emailInput.trim()} style={{ opacity: emailInput.trim() ? 1 : 0.5 }}>
            <I.key size={14}/> Send reset email
          </button>
        </>
      )}
    >
      {sent ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 12px", borderRadius: "50%", background: "#E6F0E1", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.check size={30}/>
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
            If an account exists for <strong>{emailInput}</strong>, we just sent reset instructions there. The link expires in 1 hour.
          </div>
          <div style={{ marginTop: 14, padding: 12, background: "var(--bg-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-3)", textAlign: "left" }}>
            <strong>Don't have access to that email anymore?</strong> Email Jessica directly — she can remove your old account so you can sign up fresh with a new address.
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field"><label>Email</label><input className="input" type="email" autoFocus value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="you@email.com"/></div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
            We'll send a one-time link. Click it to set a new password.
          </div>
        </form>
      )}
    </Modal>
  );
}

function SignupFlow({ step, name, setName, email, setEmail, pwd, setPwd, pwd2, setPwd2, code, setCode, sentCode, error, onContinue, onVerify, onResend, onBack, onSwitchToSignIn }) {
  if (step === 1) {
    const valid = name && email && pwd.length >= 8 && pwd === pwd2;
    return (
      <>
        <div className="hello-line" style={{ color: "var(--green)", fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 24, lineHeight: 1, marginBottom: 6 }}>say hi to your pets —</div>
        <h1>Create account</h1>
        <div className="sub">A pet-parent account. Admins can promote you later if needed.</div>

        {error && (
          <div style={{ padding: 12, background: "#FBE0E0", border: "1px solid #F2C7C7", borderRadius: 10, color: "#6B1F1F", fontSize: 13, marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--heart)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>!</div>
            <div>{error} <a href="#" onClick={e => { e.preventDefault(); onSwitchToSignIn?.(); }} style={{ color: "var(--brown)", fontWeight: 700 }}>Sign in instead →</a></div>
          </div>
        )}

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Your name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Chen" autoFocus/>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="8+ characters"/>
          </div>
          <div className="field">
            <label>Confirm</label>
            <input className="input" type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} placeholder="Type it again"/>
            {pwd2 && pwd !== pwd2 && <div style={{ color: "var(--heart)", fontSize: 11, marginTop: 3 }}>Doesn't match</div>}
          </div>
        </div>

        <button className="btn btn-block btn-lg btn-primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }} onClick={onContinue}>
          Continue
        </button>
        <div className="tiny-hint">
          By creating an account you agree to receive emails about your pet care.
        </div>
      </>
    );
  }
  if (step === 2) {
    return (
      <>
        <div className="hello-line" style={{ color: "var(--green)", fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 24, lineHeight: 1, marginBottom: 6 }}>almost there —</div>
        <h1>Verify your email</h1>
        <div className="sub">We sent a 6-digit code to <strong style={{ color: "var(--ink)" }}>{email}</strong>.</div>

        <div style={{ padding: 14, background: "#FCEFD3", border: "1px solid #E8D9A8", borderRadius: 12, marginBottom: 16, fontSize: 13, color: "#7A5615" }}>
          <strong>Demo mode:</strong> your verification code is <span className="mono" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.15em" }}>{sentCode}</span>
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>6-digit verification code</label>
          <input className="input mono" value={code} maxLength={6}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000" autoFocus
            style={{ fontSize: 18, letterSpacing: "0.25em", textAlign: "center" }}/>
        </div>

        <button className="btn btn-block btn-lg btn-primary" disabled={code.length !== 6} style={{ opacity: code.length === 6 ? 1 : 0.5 }} onClick={onVerify}>
          <I.check size={16}/> Verify & create account
        </button>
        <button className="btn btn-block btn-ghost" onClick={onBack} style={{ marginTop: 8 }}>← Back</button>
        <div className="tiny-hint">
          Didn't get it? <a href="#" onClick={e => { e.preventDefault(); onResend(); }} style={{ color: "var(--brown)", fontWeight: 700 }}>Resend code</a>
        </div>
      </>
    );
  }
  // step 3 = success
  return (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <div style={{ width: 72, height: 72, margin: "0 auto 14px", borderRadius: "50%", background: "#E6F0E1", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I.check size={36}/>
      </div>
      <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 48, color: "var(--green-deep)", margin: 0, lineHeight: 1 }}>You're in!</h1>
      <div style={{ color: "var(--ink-3)", marginTop: 8 }}>Setting up your home…</div>
    </div>
  );
}

window.LoginScreen = LoginScreen;

// Shown when an admin has flagged the account for password reset
function ResetPasswordPrompt({ info, onComplete, onCancel }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const ok = p1.length >= 8 && p1 === p2;
  return (
    <div className="login-wrap">
      <div className="login-art">
        <img src="assets/logo.jpg" alt="Jessica's Pet Sitting" className="logo" />
      </div>
      <div className="login-form">
        <div className="login-card">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "#FCEFD3", color: "#7A5615", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            <I.key size={12}/> ADMIN-REQUESTED PASSWORD RESET
          </div>
          <h1 style={{ fontSize: 36, marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--ink)", fontWeight: 800, letterSpacing: "-0.02em" }}>Set a new password</h1>
          <div className="sub">Before continuing to <strong style={{ color: "var(--ink-2)" }}>{info.email}</strong>, please choose a new password.</div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>New password</label>
            <input className="input" type="password" value={p1} onChange={e => setP1(e.target.value)} placeholder="At least 8 characters" autoFocus/>
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Confirm password</label>
            <input className="input" type="password" value={p2} onChange={e => setP2(e.target.value)} placeholder="Type it again"/>
            {p2 && p1 !== p2 && <div style={{ color: "var(--heart)", fontSize: 12, marginTop: 4 }}>Passwords don't match</div>}
          </div>

          <button className="btn btn-block btn-lg btn-primary" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={onComplete}>
            <I.check size={16}/> Set password & sign in
          </button>
          <button className="btn btn-block btn-ghost" style={{ marginTop: 8 }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
window.ResetPasswordPrompt = ResetPasswordPrompt;
