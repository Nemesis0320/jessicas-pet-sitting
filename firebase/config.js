// firebase/config.js
//
// Replace these placeholders with the values from
//   Firebase Console → Project Settings → Your apps → SDK setup
//
// These values are safe to commit — they identify the project but don't
// grant access. Access control lives in Firestore security rules.

window.FIREBASE_CONFIG = {
  apiKey:            "PASTE_API_KEY_HERE",
  authDomain:        "jessicas-pet-sitting.firebaseapp.com",
  projectId:         "jessicas-pet-sitting",
  storageBucket:     "jessicas-pet-sitting.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID_HERE",
  appId:             "PASTE_APP_ID_HERE",
};

// Flip to true once the Firebase scripts are loaded in index.html and your
// config above has real values. Until then the app uses in-memory state
// + simulated emails.
window.USE_FIREBASE = false;
