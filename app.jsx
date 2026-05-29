// Main app
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "default",
  "panels": "solid",
  "font": "sans",
  "textSize": "md",
  "a11y": {
    "contrast": false,
    "reduceMotion": false,
    "focus": false,
    "dyslexia": false,
    "underline": false,
    "colorBlind": false
  },
  "cardRadius": 22,
  "logoInNav": true,
  "showHelloLine": true
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  const body = document.body;
  // Themes
  body.classList.remove("theme-default", "theme-forest", "theme-coastal", "theme-lavender", "theme-frutiger", "theme-slate", "theme-neon", "theme-bg3", "theme-lcars");
  body.classList.add("theme-" + (t.theme || "default"));
  // Panel styles
  body.classList.remove("glass-panels", "panels-soft", "panels-outlined", "panels-floating", "panels-paper", "panels-brutal", "panels-sticker");
  const panels = t.panels || "solid";
  if (panels === "glass") body.classList.add("glass-panels");
  else if (panels !== "solid") body.classList.add("panels-" + panels);
  // Font family
  body.classList.remove("font-sans", "font-serif", "font-rounded", "font-mono");
  body.classList.add("font-" + (t.font || "sans"));
  // Text size
  body.classList.remove("a11y-text-lg", "a11y-text-xl", "a11y-text-xxl");
  if (t.textSize === "lg")  body.classList.add("a11y-text-lg");
  if (t.textSize === "xl")  body.classList.add("a11y-text-xl");
  if (t.textSize === "xxl") body.classList.add("a11y-text-xxl");
  // Accessibility toggles
  const a = t.a11y || {};
  body.classList.toggle("a11y-contrast",      !!a.contrast);
  body.classList.toggle("a11y-reduce-motion", !!a.reduceMotion);
  body.classList.toggle("a11y-focus",         !!a.focus);
  body.classList.toggle("a11y-dyslexia",      !!a.dyslexia);
  body.classList.toggle("a11y-underline",     !!a.underline);
  body.classList.toggle("a11y-cb",            !!a.colorBlind);

  root.style.setProperty("--radius-lg", t.cardRadius + "px");
  body.classList.toggle("hide-logo-nav", !t.logoInNav);
  body.classList.toggle("hide-hello", !t.showHelloLine);
}

function App() {
  const [tweaks, setTweakRaw] = useTweaks(TWEAK_DEFAULTS);
  uE(() => applyTweaks(tweaks), [tweaks]);

  const [user, setUser] = uS(null);

  // Per-user prefs persistence — load on login, save on change.
  // Wrap setTweak so any tweak change ALSO writes to localStorage for the current user. (When logged-out, only the host-disk persistence runs.)
  const setTweak = React.useCallback((keyOrEdits, val) => {
    setTweakRaw(keyOrEdits, val);
    if (!user?.email) return;
    const edits = typeof keyOrEdits === "object" && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    try {
      const k = "prefs-" + user.email;
      const existing = JSON.parse(localStorage.getItem(k) || "{}");
      localStorage.setItem(k, JSON.stringify({ ...existing, ...edits }));
    } catch (e) { /* ignore quota errors */ }
  }, [user, setTweakRaw]);

  // When a user logs in, load their saved prefs and apply.
  uE(() => {
    if (!user?.email) return;
    try {
      const saved = JSON.parse(localStorage.getItem("prefs-" + user.email) || "null");
      if (saved && typeof saved === "object") setTweakRaw(saved);
    } catch (e) { /* ignore */ }
  }, [user?.email, setTweakRaw]);
  const [route, setRoute] = uS("home");
  const [currentPetId, setCurrentPetId] = uS(null);
  const [currentHomeId, setCurrentHomeId] = uS(null);
  const [toastMsg, setToastMsg] = uS(null);

  // Data
  const [petsById, setPetsById] = uS(window.SEED.pets);
  const [homes, setHomes] = uS(window.SEED.homes);
  const [usersById, setUsersById] = uS(window.SEED.users);
  const [appointments, setAppointments] = uS(window.SEED.appointments);
  const [invoices, setInvoices] = uS(window.SEED.invoices);
  const [pricing, setPricing] = uS(window.SEED.pricing);
  const [onboardingProgress, setOnboardingProgress] = uS(window.SEED.onboarding || {});

  // Modals
  const [editHomeOpen, setEditHomeOpen] = uS(null);
  const [petFormOpen, setPetFormOpen] = uS(null);
  const [inviteOpen, setInviteOpen] = uS(false);
  const [resetTarget, setResetTarget] = uS(null);
  const [profileOpen, setProfileOpen] = uS(false);
  const [addResidentOpen, setAddResidentOpen] = uS(null);    // homeId
  const [apptFormOpen, setApptFormOpen] = uS(null);           // { editing? }

  const [pendingResets, setPendingResets] = uS(new Set());
  const [resetPrompt, setResetPrompt] = uS(null);

  // Notifications inbox — each entry is a simulated email.
  // Per-user inbox stored in localStorage so it persists between sessions.
  const [inboxes, setInboxes] = uS({});         // { [email]: [notif] }
  const [showInbox, setShowInbox] = uS(false);
  const bellRef = uR();

  const userInbox = (user?.email && inboxes[user.email]) || [];
  const unreadCount = userInbox.filter(n => !n.read).length;

  // Load inbox from localStorage when a user logs in
  uE(() => {
    if (!user?.email) return;
    try {
      const raw = localStorage.getItem("inbox-" + user.email);
      if (raw) setInboxes(prev => ({ ...prev, [user.email]: JSON.parse(raw) }));
    } catch {}
  }, [user?.email]);

  // Persist whenever the current user's inbox changes
  uE(() => {
    if (!user?.email) return;
    try { localStorage.setItem("inbox-" + user.email, JSON.stringify(userInbox)); } catch {}
  }, [userInbox, user?.email]);

  // Push a notification to one or more recipients (by email).
  // Recipients can be a single string or an array.
  const pushNotif = React.useCallback((to, notif) => {
    const recipients = Array.isArray(to) ? to : [to];
    const stamped = {
      id: "n-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      read: false,
      ...notif,
    };
    setInboxes(prev => {
      const next = { ...prev };
      recipients.forEach(addr => {
        if (!addr) return;
        const list = next[addr] ? [...next[addr]] : [];
        list.unshift({ ...stamped, to: addr });
        next[addr] = list.slice(0, 100); // cap
      });
      return next;
    });
  }, []);

  const markRead = (id) => {
    if (!user?.email) return;
    setInboxes(prev => {
      const list = (prev[user.email] || []).map(n => n.id === id ? { ...n, read: true } : n);
      return { ...prev, [user.email]: list };
    });
  };
  const markAllRead = () => {
    if (!user?.email) return;
    setInboxes(prev => {
      const list = (prev[user.email] || []).map(n => ({ ...n, read: true }));
      return { ...prev, [user.email]: list };
    });
  };

  const toast = (m) => setToastMsg(m);

  const handleLogin = (role, email) => {
    // Match a flagged home owner
    const flaggedHome = homes.find(h => pendingResets.has(h.id));
    const isFlagged = flaggedHome && (h => h.residents.some(uid => usersById[uid]?.email === email))(flaggedHome);
    if (isFlagged && role === "user") {
      setResetPrompt({ email, role, homeId: flaggedHome.id });
      return;
    }
    if (role === "admin") {
      setUser(window.SEED.admin);
      setRoute("admin");
    } else {
      // Find user record by email; default to Sarah
      const u = Object.values(usersById).find(u => u.email === email) || window.SEED.user;
      setUser({ id: u.id, name: u.name, role: "user", email: u.email, phone: u.phone, homeId: u.homeId, avatar: u.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() });
      setRoute("home");
    }
  };

  // New account creation
  const handleSignup = ({ name, email }) => {
    // Check for duplicate email across both household members and admin accounts
    const lower = email.trim().toLowerCase();
    const existing = Object.values(usersById).find(u => u.email.toLowerCase() === lower);
    const isAdmin   = window.SEED.admin.email.toLowerCase() === lower
                   || lower === "connor@jessicaspetsitting.com";
    if (existing || isAdmin) {
      toast(`An account already exists for ${email}. Try signing in or reset your password.`);
      return { ok: false, reason: "duplicate" };
    }
    const uid = "u-" + Date.now();
    const hid = "home-" + Date.now();
    const newUser = { id: uid, name, email, phone: "", homeId: hid, isPrimary: true };
    const newHome = {
      id: hid,
      name: `${name.split(" ")[0]}'s home`,
      address: "",
      residents: [uid],
      wifiNetwork: "", wifiPassword: "",
      accessKind: "Lockbox", accessDetail: "",
      emergencyVet: "", emergencyPhone: "",
      notes: "",
      pets: [],
      status: "onboarding",
    };
    setUsersById(prev => ({ ...prev, [uid]: newUser }));
    setHomes(prev => [...prev, newHome]);
    setUser({ ...newUser, role: "user", avatar: name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() });
    setRoute("home");
    toast(`Welcome, ${name.split(" ")[0]}! Set up your home below.`);
    return { ok: true };
  };

  // Forgot-password: trigger the same reset flow used by admins.
  // If the email matches a real account, flag it; either way, show the
  // same "we sent instructions" message (don't leak existence of accounts).
  const handleForgotPassword = (email) => {
    const lower = email.trim().toLowerCase();
    const home = homes.find(h => (h.residents || []).some(uid => usersById[uid]?.email.toLowerCase() === lower));
    if (home) {
      setPendingResets(prev => { const n = new Set(prev); n.add(home.id); return n; });
    }
    // Show success regardless to avoid disclosing whether the email exists.
    return { ok: true };
  };

  const completeReset = () => {
    setPendingResets(prev => { const n = new Set(prev); n.delete(resetPrompt.homeId); return n; });
    const role = resetPrompt.role;
    const email = resetPrompt.email;
    setResetPrompt(null);
    if (role === "admin") { setUser(window.SEED.admin); setRoute("admin"); }
    else {
      const u = Object.values(usersById).find(u => u.email === email) || window.SEED.user;
      setUser({ id: u.id, name: u.name, role: "user", email: u.email, phone: u.phone, homeId: u.homeId, avatar: u.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() });
      setRoute("home");
    }
    toast("Password updated — you're signed in");
  };

  const handleLogout = () => {
    setUser(null);
    setRoute("home");
    setCurrentPetId(null);
    setCurrentHomeId(null);
  };

  const [petBackRoute, setPetBackRoute] = uS("adminHome");
  const openPet = (id) => {
    if (user?.role === "admin") {
      // Decide back-route based on current admin route
      if (route === "adminPets" || route === "adminActive") setPetBackRoute(route);
      else setPetBackRoute("adminHome");
    }
    setCurrentPetId(id);
    setRoute("pet");
  };
  const openHome = (id) => { setCurrentHomeId(id); setRoute("adminHome"); };

  // Member edit/remove handlers used by HouseholdMemberModal (window.__... pattern)
  // MUST be declared before any early return to keep hook order stable across renders.
  uE(() => {
    window.__updateMember = (m) => {
      setUsersById(prev => ({ ...prev, [m.id]: { ...prev[m.id], ...m } }));
      if (user && m.id === user.id) {
        setUser(u => ({ ...u, name: m.name, email: m.email, phone: m.phone, avatar: m.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() }));
      }
    };
    window.__removeMember = (uid) => {
      setHomes(prev => prev.map(h => ({ ...h, residents: (h.residents || []).filter(r => r !== uid) })));
      setUsersById(prev => { const n = { ...prev }; delete n[uid]; return n; });
    };
    window.__updatePet = (p) => setPetsById(prev => ({ ...prev, [p.id]: p }));
    window.__pushNotif = pushNotif;
    return () => { delete window.__updateMember; delete window.__removeMember; delete window.__updatePet; delete window.__pushNotif; };
  }, [user]);

  if (!user) {
    if (resetPrompt) return <ResetPasswordPrompt info={resetPrompt} onComplete={completeReset} onCancel={() => setResetPrompt(null)}/>;
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} onForgotPassword={handleForgotPassword}/>;
  }

  // Current user's home + pets + residents
  const userHome = homes.find(h => h.id === user.homeId);
  const userPets = userHome ? userHome.pets.map(pid => petsById[pid]).filter(Boolean) : [];
  const userResidents = userHome ? (userHome.residents || []).map(uid => usersById[uid]).filter(Boolean) : [];
  const userAppointments = userHome ? appointments.filter(a => a.homeId === userHome.id) : [];

  const currentPet = currentPetId ? petsById[currentPetId] : null;
  const currentHome = currentHomeId ? homes.find(h => h.id === currentHomeId) : null;
  const homeForPet = currentPet ? homes.find(h => h.id === currentPet.home) : null;
  const homePets = currentHome ? currentHome.pets.map(pid => petsById[pid]).filter(Boolean) : [];

  const updatePet = (p) => setPetsById(prev => ({ ...prev, [p.id]: p }));
  const removePet = (id) => {
    setPetsById(prev => { const n = { ...prev }; delete n[id]; return n; });
    setHomes(prev => prev.map(h => ({ ...h, pets: h.pets.filter(pid => pid !== id) })));
    setRoute(user.role === "admin" ? "adminHome" : "home");
    toast("Pet removed");
  };

  const updateHome = (h) => setHomes(prev => prev.map(x => x.id === h.id ? { ...x, ...h } : x));

  const updateProfile = (p) => {
    setUsersById(prev => ({ ...prev, [user.id]: { ...prev[user.id], ...p } }));
    setUser(u => ({ ...u, ...p, avatar: p.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() }));
    toast("Profile saved");
  };

  // Appointment handlers
  const submitAppt = ({ start, end, notes }) => {
    const adminEmails = ["jessica@jessicaspetsitting.com", "connor@jessicaspetsitting.com"];
    const dateStr = `${window.fmtDateShort(start)} – ${window.fmtDateShort(end)}`;
    if (apptFormOpen?.editing) {
      const id = apptFormOpen.editing.id;
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, start, end, notes, status: "pending" } : a));
      toast("Request updated — pending admin review again");
      pushNotif(adminEmails, {
        kind: "request_submitted",
        title: `Updated sitting request from ${user.name}`,
        summary: `Dates changed to ${dateStr}. Awaiting your review.`,
        fields: [
          { label: "Home",    value: userHome.name },
          { label: "Owner",   value: user.name + " · " + user.email },
          { label: "Arrives", value: window.fmtDate(start) },
          { label: "Departs", value: window.fmtDate(end) },
          { label: "Days",    value: window.daysBetween(start, end) + " days" },
          { label: "Notes",   value: notes || "—" },
        ],
        cta: "Review request in app",
      });
    } else {
      const appt = {
        id: "ap-" + Date.now(),
        homeId: userHome.id, requestedBy: user.id,
        start, end, notes,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAppointments(prev => [...prev, appt]);
      toast("Request submitted — admin will review shortly");
      pushNotif(adminEmails, {
        kind: "request_submitted",
        title: `New sitting request from ${user.name}`,
        summary: `${dateStr} at ${userHome.name}. ${userPets.length} pet${userPets.length === 1 ? "" : "s"}.`,
        fields: [
          { label: "Home",    value: userHome.name },
          { label: "Owner",   value: user.name + " · " + user.email },
          { label: "Address", value: userHome.address || "—" },
          { label: "Arrives", value: window.fmtDate(start) },
          { label: "Departs", value: window.fmtDate(end) },
          { label: "Days",    value: window.daysBetween(start, end) + " days" },
          { label: "Pets",    value: userPets.map(p => p.name).join(", ") || "—" },
          { label: "Notes",   value: notes || "—" },
        ],
        cta: "Review request in app",
      });
      pushNotif(user.email, {
        kind: "request_submitted",
        title: "Request received",
        summary: `We got your sitting request for ${dateStr}. Jessica will review and confirm shortly.`,
        body: `Hi ${user.name.split(" ")[0]},\n\nWe've received your sitting request and will review it shortly. You'll get another email once it's been approved or if we need more info.\n\nThanks for trusting us with your pets!\n\n— Jessica's Pet Sitting`,
      });
    }
    setApptFormOpen(null);
  };
  const cancelAppt = (id) => { setAppointments(prev => prev.filter(a => a.id !== id)); toast("Sitting request canceled"); };
  const decideAppt = (id, status) => {
    const appt = appointments.find(a => a.id === id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (!appt) return;
    const owner = usersById[appt.requestedBy];
    const home = homes.find(h => h.id === appt.homeId);
    if (!owner) return;
    if (status === "approved") {
      pushNotif(owner.email, {
        kind: "request_approved",
        title: "Your sitting request was approved 🐾",
        summary: `Confirmed for ${window.fmtDateShort(appt.start)} – ${window.fmtDateShort(appt.end)} at ${home?.name}.`,
        body: `Hi ${owner.name.split(" ")[0]},\n\nGreat news — your sitting request has been approved! Jessica will arrive on ${window.fmtDate(appt.start)} and depart on ${window.fmtDate(appt.end)}.\n\nWe'll send daily updates during the sitting. If you need to make any changes, just reply to this email or update the request in the app.`,
        cta: "View confirmation",
      });
    } else if (status === "rejected") {
      pushNotif(owner.email, {
        kind: "request_rejected",
        title: "About your sitting request…",
        summary: `Unfortunately Jessica can't cover ${window.fmtDateShort(appt.start)} – ${window.fmtDateShort(appt.end)}.`,
        body: `Hi ${owner.name.split(" ")[0]},\n\nUnfortunately we aren't able to cover the dates you requested. Please reach out directly — we may be able to recommend another sitter, or you can submit a new request for different dates.\n\nSorry about this!\n\n— Jessica's Pet Sitting`,
      });
    }
  };

  const pendingRequestsCount = appointments.filter(a => a.status === "pending").length;

  const navAdmin = (r) => { if (r === "admin") setCurrentHomeId(null); setRoute(r); };
  const navUser  = (r) => setRoute(r);

  const currentRouteForNav = (() => {
    if (user.role === "admin") {
      if (route === "requests") return "requests";
      if (route === "schedule") return "schedule";
      if (route === "settings") return "settings";
      if (route === "invoices") return "invoices";
      return "admin";
    }
    if (route === "settings-user") return "settings-user";
    return "home";
  })();

  return (
    <div className="app">
      <TopNav
        user={user}
        currentRoute={currentRouteForNav}
        onNav={user.role === "admin" ? navAdmin : navUser}
        onLogout={handleLogout}
        onProfile={() => setProfileOpen(true)}
        onBell={() => setShowInbox(s => !s)}
        bellRef={bellRef}
        unreadCount={unreadCount}
        pendingRequests={pendingRequestsCount}
      />

      {showInbox && (
        <InboxPopover
          items={userInbox}
          anchorRef={bellRef}
          onClose={() => setShowInbox(false)}
          onMarkAllRead={markAllRead}
          onOpenAll={() => setRoute(user.role === "admin" ? "admin-inbox" : "user-inbox")}
          onOpenItem={(n) => { markRead(n.id); setRoute(user.role === "admin" ? "admin-inbox" : "user-inbox"); }}
        />
      )}

      {(route === "user-inbox" || route === "admin-inbox") && (
        <NotificationsPage
          items={userInbox}
          user={user}
          onBack={() => setRoute(user.role === "admin" ? "admin" : "home")}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
        />
      )}

      {/* User flow */}
      {user.role !== "admin" && route === "home" && userHome && (
        <UserHomeScreen
          user={user}
          home={userHome}
          pets={userPets}
          residents={userResidents}
          appointments={userAppointments}
          invoices={invoices.filter(i => i.homeId === userHome.id)}
          pricing={pricing}
          onOpenPet={openPet}
          onAddPet={() => setPetFormOpen({ homeId: userHome.id })}
          onEditHome={() => setEditHomeOpen(userHome)}
          onEditProfile={() => setProfileOpen(true)}
          onRequestAppt={() => setApptFormOpen({})}
          onEditAppt={(a) => setApptFormOpen({ editing: a })}
          onCancelAppt={cancelAppt}
          toast={toast}
        />
      )}
      {user.role !== "admin" && route === "pet" && currentPet && (
        <PetDetailScreen
          pet={currentPet} home={homeForPet}
          onBack={() => setRoute("home")}
          onUpdate={updatePet}
          onEdit={() => setPetFormOpen({ pet: currentPet, homeId: currentPet.home })}
          onDelete={() => removePet(currentPet.id)}
          toast={toast}
        />
      )}
      {user.role !== "admin" && route === "settings-user" && (
        <UserSettings
          user={user} home={userHome}
          tweaks={tweaks} setTweak={setTweak}
          onEditProfile={() => setProfileOpen(true)}
          onChangePassword={() => setProfileOpen(true)}
          toast={toast}
        />
      )}

      {/* Admin flow */}
      {user.role === "admin" && (route === "admin" || route === "schedule" || route === "settings" || route === "requests" || route === "adminPets" || route === "adminActive" || route === "invoices") && (
        <AdminScreen
          user={user} route={route}
          homes={homes} allPets={petsById} allUsers={usersById} appointments={appointments}
          invoices={invoices} pricing={pricing}
          tweaks={tweaks} setTweak={setTweak}
          onOpenHome={openHome}
          onOpenPet={openPet}
          onNav={navAdmin}
          onInviteHomeowner={() => setInviteOpen(true)}
          onDecideAppt={decideAppt}
          onUpdateInvoice={(inv) => {
            const existing = invoices.find(x => x.id === inv.id);
            setInvoices(prev => prev.map(x => x.id === inv.id ? inv : x));
            // Email events on status transitions
            const home = homes.find(h => h.id === inv.homeId);
            const primary = home?.residents?.map(uid => usersById[uid]).find(u => u && u.isPrimary) || usersById[home?.residents?.[0]];
            if (!primary?.email || !existing) return;
            if (existing.status !== "sent" && inv.status === "sent") {
              pushNotif(primary.email, {
                kind: "invoice_sent",
                title: `Invoice #${inv.number} — $${inv.total}`,
                summary: `For ${inv.days} day${inv.days === 1 ? "" : "s"} of pet sitting at ${home?.name}.`,
                fields: [
                  { label: "Invoice #", value: inv.number },
                  { label: "Issued",    value: new Date(inv.issued).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Due in",    value: inv.dueIn + " days" },
                  { label: "Days",      value: inv.days },
                  { label: "Pets",      value: inv.petCount },
                  { label: "Total",     value: "$" + inv.total },
                ],
                cta: "View invoice",
              });
            } else if (existing.status !== "paid" && inv.status === "paid") {
              pushNotif(primary.email, {
                kind: "invoice_paid",
                title: `Payment received for Invoice #${inv.number}`,
                summary: `Thanks! Your $${inv.total} payment has been recorded.`,
              });
            }
          }}
          onCreateInvoice={() => {
            const home = homes[0];
            const newInv = {
              id: "inv-" + Date.now(),
              homeId: home.id,
              apptId: null,
              number: "2026-" + String(invoices.length + 1).padStart(3, "0"),
              issued: new Date().toISOString().split("T")[0],
              dueIn: 14,
              days: 1, petCount: 1, rate: pricing.baseRate, extras: [],
              total: pricing.baseRate, status: "draft",
            };
            setInvoices(prev => [...prev, newInv]);
            toast("Draft invoice created");
          }}
          onUpdatePricing={(p) => setPricing(p)}
          toast={toast}
        />
      )}
      {user.role === "admin" && route === "adminHome" && currentHome && (
        <AdminHomeDetail
          home={currentHome} pets={homePets} allUsers={usersById} appointments={appointments}
          allPets={petsById}
          onboardingProgress={onboardingProgress[currentHome.id] || {}}
          onToggleOnboarding={(stepId) => {
            setOnboardingProgress(prev => {
              const home = prev[currentHome.id] || {};
              const next = { ...home };
              if (next[stepId]) delete next[stepId];
              else next[stepId] = new Date().toISOString();
              return { ...prev, [currentHome.id]: next };
            });
          }}
          onCompleteOnboarding={() => {
            setHomes(prev => prev.map(h => h.id === currentHome.id ? { ...h, status: "upcoming" } : h));
            toast("Onboarding complete! Home moved to upcoming.");
          }}
          onBack={() => setRoute("admin")}
          onOpenPet={openPet}
          onEditHome={() => setEditHomeOpen(currentHome)}
          onAddPet={() => setPetFormOpen({ homeId: currentHome.id })}
          onResetPassword={() => {
            const primary = currentHome.residents.map(uid => usersById[uid]).find(u => u && u.isPrimary) || usersById[currentHome.residents[0]];
            setResetTarget({ id: currentHome.id, name: primary?.name || "owner", email: primary?.email, kind: "user" });
          }}
          onDeleteHome={(hid) => {
            // Cascade delete: home, its pets, appointments, invoices, onboarding, household members
            const home = homes.find(h => h.id === hid);
            if (!home) return;
            const pets = home.pets || [];
            setPetsById(prev => { const n = { ...prev }; pets.forEach(pid => delete n[pid]); return n; });
            setHomes(prev => prev.filter(h => h.id !== hid));
            setAppointments(prev => prev.filter(a => a.homeId !== hid));
            setInvoices(prev => prev.filter(i => i.homeId !== hid));
            setOnboardingProgress(prev => { const n = { ...prev }; delete n[hid]; return n; });
            setUsersById(prev => {
              const n = { ...prev };
              (home.residents || []).forEach(uid => delete n[uid]);
              return n;
            });
            setRoute("admin");
            toast(`${home.name} and all related records removed`);
          }}
          pendingResets={pendingResets}
        />
      )}
      {user.role === "admin" && route === "pet" && currentPet && (
        <PetDetailScreen
          pet={currentPet} home={homeForPet}
          onBack={() => setRoute(petBackRoute)}
          onUpdate={updatePet}
          onEdit={() => setPetFormOpen({ pet: currentPet, homeId: currentPet.home })}
          onDelete={() => removePet(currentPet.id)}
          toast={toast}
        />
      )}

      {/* Modals */}
      {editHomeOpen && (
        <HomeForm
          home={editHomeOpen}
          allUsers={usersById}
          onClose={() => setEditHomeOpen(null)}
          onSave={(h) => { updateHome(h); setEditHomeOpen(null); toast("Home details saved"); }}
          onAddResident={() => setAddResidentOpen(editHomeOpen.id)}
          onRemoveResident={(uid) => {
            setHomes(prev => prev.map(x => x.id === editHomeOpen.id ? { ...x, residents: x.residents.filter(r => r !== uid) } : x));
            setEditHomeOpen(prev => prev ? { ...prev, residents: prev.residents.filter(r => r !== uid) } : prev);
            toast("Resident removed");
          }}
        />
      )}
      {addResidentOpen && (
        <AddResidentModal
          onClose={() => setAddResidentOpen(null)}
          onAdd={({ name, email, phone }) => {
            const uid = "u-" + Date.now();
            const newU = { id: uid, name, email, phone, homeId: addResidentOpen, isPrimary: false };
            setUsersById(prev => ({ ...prev, [uid]: newU }));
            setHomes(prev => prev.map(x => x.id === addResidentOpen ? { ...x, residents: [...x.residents, uid] } : x));
            setEditHomeOpen(prev => prev ? { ...prev, residents: [...prev.residents, uid] } : prev);
            setAddResidentOpen(null);
            toast(`Invite sent to ${email}`);
          }}
        />
      )}
      {petFormOpen && (
        <PetForm
          pet={petFormOpen.pet} homeId={petFormOpen.homeId}
          onClose={() => setPetFormOpen(null)}
          onSave={(p) => {
            const isEdit = !!petFormOpen.pet;
            setPetsById(prev => ({ ...prev, [p.id]: p }));
            if (!isEdit) setHomes(prev => prev.map(h => h.id === p.home ? { ...h, pets: [...h.pets, p.id] } : h));
            setPetFormOpen(null);
            toast(isEdit ? `${p.name} updated` : `${p.name} added`);
          }}
          onDelete={petFormOpen.pet ? () => { removePet(petFormOpen.pet.id); setPetFormOpen(null); } : null}
        />
      )}
      {inviteOpen && (
        <InviteHomeownerModal
          onClose={() => setInviteOpen(false)}
          onInvite={({ home, user: newUser }) => {
            setUsersById(prev => ({ ...prev, [newUser.id]: newUser }));
            setHomes(prev => [...prev, home]);
            setInviteOpen(false);
            toast(`Invite sent to ${newUser.email}`);
          }}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onConfirm={() => {
            setPendingResets(prev => { const n = new Set(prev); n.add(resetTarget.id); return n; });
            toast(`Password reset link sent to ${resetTarget.name}`);
            setResetTarget(null);
          }}
        />
      )}
      {profileOpen && (
        <ProfileModal
          user={user}
          home={userHome}
          onClose={() => setProfileOpen(false)}
          onSave={(p) => { updateProfile(p); setProfileOpen(false); }}
        />
      )}
      {/* Seed an initial notification once per user session so the bell shows something live */}
      {apptFormOpen && userHome && (
        <RequestApptModal
          home={userHome}
          editing={apptFormOpen.editing}
          onClose={() => setApptFormOpen(null)}
          onSubmit={submitAppt}
        />
      )}

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)}/>}

      {/* Tiny credits link */}
      <a className="app-credits" href="https://github.com/Nemesis0320/" target="_blank" rel="noopener noreferrer">
        Made by Connor Boesch · 2026
      </a>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Developer">
          <div style={{ fontSize: 11, color: "var(--ink-3)", padding: "4px 12px 10px" }}>
            Theme & glass live in <strong>Settings → Appearance</strong>.<br/>These are deeper knobs.
          </div>
          <TweakSlider label="Card radius" value={tweaks.cardRadius} onChange={v => setTweak("cardRadius", v)} min={6} max={32} step={1} unit="px"/>
          <TweakToggle label="Logo in nav" value={tweaks.logoInNav} onChange={v => setTweak("logoInNav", v)}/>
          <TweakToggle label='Script "hello" lines' value={tweaks.showHelloLine} onChange={v => setTweak("showHelloLine", v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
