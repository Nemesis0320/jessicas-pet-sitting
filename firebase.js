import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyC-EysJqUh2Jw_h0h-ExEw9SS9yyD2oBkU",
  authDomain: "jessicas-pet-sitting.firebaseapp.com",
  projectId: "jessicas-pet-sitting",
  storageBucket: "jessicas-pet-sitting.firebasestorage.app",
  messagingSenderId: "931131544623",
  appId: "1:931131544623:web:de599d503f03e6961962da"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
export {
  auth,
  db,
  googleProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
};
