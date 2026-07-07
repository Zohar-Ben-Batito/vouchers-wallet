import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRcO6bi7L6jUPidI6GMRMCBm6c2TSIPZg",
  authDomain: "vouchersproject.firebaseapp.com",
  projectId: "vouchersproject",
  storageBucket: "vouchersproject.firebasestorage.app",
  messagingSenderId: "557672288894",
  appId: "1:557672288894:web:b6b494406eacf526eabe2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with fallback for Incognito/Private tabs where IndexedDB is blocked
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  console.warn("Firestore offline cache failed, falling back to in-memory cache:", error);
  db = getFirestore(app);
}

// Initialize Auth
const auth = getAuth(app);

export { auth, db };
