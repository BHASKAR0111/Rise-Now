import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2__vKiROvrPOyomY8X-pDBY8VlArDbdY",
  authDomain: "risenow-31893.firebaseapp.com",
  databaseURL: "https://risenow-31893-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "risenow-31893",
  storageBucket: "risenow-31893.firebasestorage.app",
  messagingSenderId: "230298271225",
  appId: "1:230298271225:web:c24d7100fc8b89a268d128",
  measurementId: "G-RC17E84XEV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export { signInWithPopup, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut };
