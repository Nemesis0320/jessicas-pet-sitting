<script>
  const firebaseConfig = {
    apiKey: "AIzaSyC-EysJqUh2Jw_h0h-ExEw9SS9yyD2oBkU",
    authDomain: "jessicas-pet-sitting.firebaseapp.com",
    projectId: "jessicas-pet-sitting",
    storageBucket: "jessicas-pet-sitting.firebasestorage.app",
    messagingSenderId: "931131544623",
    appId: "1:931131544623:web:de599d503f03e6961962da"
    // measurementId intentionally omitted (analytics disabled)
  };

  // Initialize Firebase (v8 syntax)
  firebase.initializeApp(firebaseConfig);

  // Global handles
  window.auth = firebase.auth();
  window.db   = firebase.firestore();
</script>
