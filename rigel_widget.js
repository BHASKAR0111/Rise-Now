/**
 * RIGEL ENGINE (v2.1)
 * The modular backend engine for Rigel SaaS.
 * Handles: Modular Auth, XP Persistence, and Global UI Sync.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2__vKiROvrPOyomY8X-pDBY8VlArDbdY",
  authDomain: "risenow-31893.firebaseapp.com",
  projectId: "risenow-31893",
  storageBucket: "risenow-31893.firebasestorage.app",
  messagingSenderId: "230298271225",
  appId: "1:230298271225:web:c24d7100fc8b89a268d128"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Attach to window for global access
window.rigelAuth = auth;
window.rigelDb = db;

onAuthStateChanged(auth, async (user) => {
  window.rigelUser = user;
  
  // Sync Profile UI
  const name = user ? (user.displayName || user.email?.split('@')[0] || 'User') : 'Sign In';
  const email = user ? (user.email || 'Guest Session') : '';
  const photo = user ? user.photoURL : '';

  const dropdownName = document.getElementById('dropdownName');
  const dropdownEmail = document.getElementById('dropdownEmail');
  const profileImg = document.getElementById('profileImg');
  const profileIcon = document.getElementById('profileIcon');
  const loggedOut = document.getElementById('dropdownLoggedOut');
  const loggedIn = document.getElementById('dropdownLoggedIn');

  if (user) {
    if(dropdownName) dropdownName.innerText = name;
    if(dropdownEmail) dropdownEmail.innerText = email;
    if(profileImg && photo) {
      profileImg.src = photo;
      profileImg.style.display = 'block';
      if(profileIcon) profileIcon.style.display = 'none';
    }
    if(loggedOut) loggedOut.style.display = 'none';
    if(loggedIn) loggedIn.style.display = 'block';
    
    // Auto-XP for login
    if (!sessionStorage.getItem('rigel_login_xp')) {
      window.addXP(5, 'Daily Login');
      sessionStorage.setItem('rigel_login_xp', 'true');
    }
  } else {
    if(loggedOut) loggedOut.style.display = 'block';
    if(loggedIn) loggedIn.style.display = 'none';
    if(profileImg) profileImg.style.display = 'none';
    if(profileIcon) profileIcon.style.display = 'block';
  }
});

// GLOBAL FUNCTIONS
window.signOutUser = () => signOut(auth).then(() => window.location.reload());
window.toggleDropdown = () => document.getElementById('profileDropdown')?.classList.toggle('open');
window.openLogin = () => {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('open');
    else window.location.href = 'index.html?login=true';
};

// XP SYSTEM
window.addXP = function(points, reason) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:100px; right:30px; background:rgba(0,194,255,0.1); border:1px solid #00C2FF; color:#00C2FF; padding:12px 20px; border-radius:12px; font-weight:700; z-index:10000; animation: fadeUp 0.3s ease-out;";
    toast.innerHTML = `+${points} XP: ${reason}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.remove(), 500); }, 3000);
    
    // Inject confetti if loaded
    if(window.confetti) window.confetti({ particleCount: 40, spread: 50, origin: { y: 0.9 }, colors:['#00C2FF','#00e676'] });
};

// UI INITIALIZATION
(function initStyles() {
    const s = document.createElement('style');
    s.innerHTML = `
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .rigel-fab { position:fixed; bottom:30px; right:30px; width:60px; height:60px; background:linear-gradient(135deg,#00C2FF,#0077ff); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 10px 30px rgba(0,194,255,0.4); z-index:9998; transition:transform 0.2s; }
        .rigel-fab:hover { transform: scale(1.1); }
        .profile-dropdown.open { display: block !important; }
    `;
    document.head.appendChild(s);
})();
