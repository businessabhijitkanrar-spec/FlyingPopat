import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configured with credentials provided by user
const firebaseConfig = {
  apiKey: "AIzaSyC9jn8Ye-Ymg7_IgVgejEsq46ttVcKpOFc",
  authDomain: "flyingpopat-7a2d8.firebaseapp.com",
  projectId: "flyingpopat-7a2d8",
  storageBucket: "flyingpopat-7a2d8.firebasestorage.app",
  messagingSenderId: "813736120742",
  appId: "1:813736120742:web:2f8bedab25df725345bf67",
  measurementId: "G-71D6K71REX"
};

// Check if the config is still using placeholders
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                                    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase Configured Successfully");
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
    // Fallback if init fails
    auth = null;
    db = null;
  }
} else {
  console.warn("Firebase is not configured. Using Local Storage Mock Mode.");
}

export { auth, db };