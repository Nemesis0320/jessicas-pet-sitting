console.log("DEBUGGING: APP.JSX IS LIVE");
import { useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "./firebase.js";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [resetInfo, setResetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(fbUser);

      const adminRef = doc(db, "config", "admins");
      const adminSnap = await getDoc(adminRef);
      const adminEmails = adminSnap.exists() ? adminSnap.data().emails : [];
      const isInitialAdmin = adminEmails.includes(fbUser.email);

      const userRef = doc(db, "users", fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const initials = fbUser.displayName
          ? fbUser.displayName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .toUpperCase()
          : (fbUser.email[0] || "?").toUpperCase();

        const newProfile = {
          name: fbUser.displayName || "",
          email: fbUser.email,
          role: isInitialAdmin ? "admin" : "user",
          homeId: null,
          isPrimary: true,
          avatar: initials,
          provider:
            fbUser.providerData?.[0]?.providerId === "google.com"
              ? "google"
              : "password",
          photoURL: fbUser.photoURL || null,
          onboardingComplete: false,
          disabled: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };

        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      } else {
        const data = userSnap.data();
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
        setProfile(data);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);
  const loginWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred;
  };

  const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const startPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const completePasswordReset = async (oobCode, newPassword) => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={loginWithEmail}
        onSignup={signupWithEmail}
        onGoogle={loginWithGoogle}
        onForgot={startPasswordReset}
      />
    );
  }

  if (profile && profile.disabled) {
    return <div>Your account is disabled.</div>;
  }

  if (profile && !profile.onboardingComplete) {
    return (
      <OnboardingScreen
        user={user}
        profile={profile}
        onComplete={async (updates) => {
          const ref = doc(db, "users", user.uid);
          await updateDoc(ref, updates);
          setProfile({ ...profile, ...updates });
        }}
      />
    );
  }

  return (
    <MainApp
      user={user}
      profile={profile}
      onLogout={logout}
    />
  );
}
function LoginScreen({ onLogin, onSignup, onGoogle, onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      await onLogin(email, password);
    } else {
      await onSignup(email, password, name);
    }
  };

  return (
    <div>
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      <button onClick={onGoogle}>Continue with Google</button>

      {mode === "login" && (
        <button onClick={() => onForgot(email)}>Forgot Password</button>
      )}

      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

function OnboardingScreen({ user, profile, onComplete }) {
  const [homeName, setHomeName] = useState("");

  const handleFinish = async () => {
    await onComplete({
      onboardingComplete: true,
      homeId: homeName || null
    });
  };

  return (
    <div>
      <h2>Welcome, {profile.name || user.email}</h2>
      <input
        placeholder="Home name (optional)"
        value={homeName}
        onChange={(e) => setHomeName(e.target.value)}
      />
      <button onClick={handleFinish}>Finish</button>
    </div>
  );
}

function MainApp({ user, profile, onLogout }) {
  return (
    <div>
      <h2>Hello, {profile.name || user.email}</h2>
      <p>Role: {profile.role}</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
function useQuery() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

export default App;
