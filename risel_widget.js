/**
 * RISEL ENGINE (v4.0 - Global Fix)
 * The universal backend engine for Risel SaaS.
 * This version uses a flattened architecture to bypass caching and scope issues.
 */

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDEYfHY-Cgw0oqBD7dA3h4TSAinZEymwKQ",
  authDomain: "risel-ai-10bc7.firebaseapp.com",
  projectId: "risel-ai-10bc7",
  storageBucket: "risel-ai-10bc7.firebasestorage.app",
  messagingSenderId: "471691588472",
  appId: "1:471691588472:web:4658afc09838568058ce8d",
  measurementId: "G-PTHX2ENGPK"
};

// --- INITIALIZE ---
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Protocol Fix
if (window.location.protocol === 'file:') {
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(e => {});
}

window.riselAuth = auth;
window.riselDb = db;

// --- STATE SYNC ---
auth.onAuthStateChanged(async (user) => {
    window.riselUser = user;
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
    } else {
        if(loggedOut) loggedOut.style.display = 'block';
        if(loggedIn) loggedIn.style.display = 'none';
        if(profileImg) profileImg.style.display = 'none';
        if(profileIcon) profileIcon.style.display = 'block';
    }
});

// --- UTILITIES ---
window.showError = (panel, message) => {
    console.error(`[RISEL] Auth Error State: ${message}`);
    const id = panel === 'signin' ? 'signin-error' : 'register-error';
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = `<div style="background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; padding:10px; border-radius:10px; color:#ff4757; font-size:13px; font-weight:700; animation:shake 0.4s;">⚠️ ${message}</div>`;
        el.style.display = 'block';
        el.style.marginBottom = '20px';
    } else {
        alert("⚠️ " + message);
    }
};

function friendlyError(code) {
    switch(code) {
        case 'auth/user-not-found': return 'User not found. Please register.';
        case 'auth/wrong-password': return 'Incorrect password.';
        case 'auth/invalid-email': return 'Invalid email address.';
        case 'auth/email-already-in-use': return 'Email already registered.';
        case 'auth/weak-password': return 'Password is too weak (min 6 chars).';
        case 'auth/admin-restricted-operation': return 'Guest login is disabled. Please enable "Anonymous Authentication" in Firebase Console.';
        case 'auth/popup-blocked': return 'Sign-in popup was blocked by your browser.';
        default: return `Error: ${code}`;
    }
}

// --- ACTIONS ---
window.signInAsGuest = async () => {
    try {
        await auth.signInAnonymously();
        window.closeLogin();
        if (window.location.pathname.includes('index.html')) window.location.href = 'dashboard.html';
    } catch(e) { 
        console.error("Guest Fail:", e);
        window.showError('signin', friendlyError(e.code)); 
    }
};

window.signInWithEmail = async () => {
    const e = document.getElementById('signin-email')?.value.trim();
    const p = document.getElementById('signin-password')?.value;
    if (!e || !p) { window.showError('signin', 'Enter email and password.'); return; }
    try {
        await auth.signInWithEmailAndPassword(e, p);
        window.closeLogin();
        if (window.location.pathname.includes('index.html')) window.location.href = 'dashboard.html';
    } catch(err) { window.showError('signin', friendlyError(err.code)); }
};

window.registerWithEmail = async () => {
    const n = document.getElementById('register-name')?.value.trim();
    const e = document.getElementById('register-email')?.value.trim();
    const p = document.getElementById('register-password')?.value;
    if(!n || !e || !p) { window.showError('register', 'Fill all fields.'); return; }
    try {
        const cred = await auth.createUserWithEmailAndPassword(e, p);
        await cred.user.updateProfile({ displayName: n });
        window.closeLogin();
        if (window.location.pathname.includes('index.html')) window.location.href = 'dashboard.html';
    } catch(err) { window.showError('register', friendlyError(err.code)); }
};

window.signInWithGoogle = async () => {
    if (location.protocol === 'file:') { window.showError('signin', 'Social login blocked on local files. Use Email or Guest mode.'); return; }
    try {
        await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        window.closeLogin();
        if (window.location.pathname.includes('index.html')) window.location.href = 'dashboard.html';
    } catch(e) { window.showError('signin', friendlyError(e.code)); }
};

window.signInWithGitHub = async () => {
    if (location.protocol === 'file:') { window.showError('signin', 'Social login blocked on local files. Use Email or Guest mode.'); return; }
    try {
        await auth.signInWithPopup(new firebase.auth.GithubAuthProvider());
        window.closeLogin();
        if (window.location.pathname.includes('index.html')) window.location.href = 'dashboard.html';
    } catch(e) { window.showError('signin', friendlyError(e.code)); }
};

// --- UI ---
window.injectLoginModal = () => {
    if (document.getElementById('loginOverlay')) return;
    const h = `
        <div id="loginOverlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:99999; display:none; align-items:center; justify-content:center; font-family:'Inter',sans-serif;">
            <div style="background:#131a17; border:1px solid rgba(255,255,255,0.07); border-radius:24px; padding:40px; width:100%; max-width:440px; text-align:center; position:relative; animation:fadeUp 0.3s ease-out;">
                <button onclick="closeLogin()" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:rgba(255,255,255,0.4); font-size:24px; cursor:pointer;">&times;</button>
                <h3 style="color:white; font-size:26px; font-weight:900; margin-bottom:8px;">Welcome to Risel</h3>
                <p style="color:rgba(255,255,255,0.4); font-size:14px; margin-bottom:28px;">Sign in to save your progress.</p>
                <div style="display:flex; background:rgba(255,255,255,0.04); border-radius:12px; padding:4px; margin-bottom:24px;">
                    <button id="tab-signin-btn" onclick="switchTab('signin')" style="flex:1; padding:12px; border:none; border-radius:10px; background:#1e2d28; color:white; font-weight:600; cursor:pointer;">Sign In</button>
                    <button id="tab-register-btn" onclick="switchTab('register')" style="flex:1; padding:12px; border:none; border-radius:10px; background:transparent; color:rgba(255,255,255,0.4); font-weight:600; cursor:pointer;">Register</button>
                </div>
                <div id="panel-signin">
                    <button onclick="signInWithGoogle()" style="width:100%; padding:14px; background:white; color:black; border:none; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:12px;">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20"/> Continue with Google
                    </button>
                    <button onclick="signInWithGitHub()" style="width:100%; padding:14px; background:#24292e; color:white; border:none; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
                        Continue with GitHub
                    </button>
                    <button onclick="signInAsGuest()" style="width:100%; padding:14px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:rgba(255,255,255,0.5); font-weight:600; cursor:pointer; margin-bottom:20px;">Continue as Guest</button>
                    <div id="signin-error" style="display:none; margin-bottom:15px;"></div>
                    <input id="signin-email" type="email" placeholder="Email" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; margin-bottom:10px; box-sizing:border-box;"/>
                    <input id="signin-password" type="password" placeholder="Password" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; margin-bottom:15px; box-sizing:border-box;"/>
                    <button onclick="signInWithEmail()" style="width:100%; padding:14px; background:#00C2FF; border:none; border-radius:12px; color:black; font-weight:800; cursor:pointer;">Sign In</button>
                    <div style="margin-top:20px; font-size:13px; color:rgba(255,255,255,0.4);">New here? <a onclick="switchTab('register')" style="color:#00C2FF; cursor:pointer; text-decoration:underline;">Register here</a></div>
                </div>
                <div id="panel-register" style="display:none;">
                    <div id="register-error" style="display:none; margin-bottom:15px;"></div>
                    <input id="register-name" type="text" placeholder="Full Name" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; margin-bottom:10px; box-sizing:border-box;"/>
                    <input id="register-email" type="email" placeholder="Email" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; margin-bottom:10px; box-sizing:border-box;"/>
                    <input id="register-password" type="password" placeholder="Password (min 6 chars)" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white; margin-bottom:15px; box-sizing:border-box;"/>
                    <button onclick="registerWithEmail()" style="width:100%; padding:14px; background:#00C2FF; border:none; border-radius:12px; color:black; font-weight:800; cursor:pointer;">Create Account</button>
                    <div style="margin-top:20px; font-size:13px; color:rgba(255,255,255,0.4);">Already have an account? <a onclick="switchTab('signin')" style="color:#00C2FF; cursor:pointer; text-decoration:underline;">Sign in</a></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            @keyframes shake { 0%, 100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
        </style>
    `;
    const d = document.createElement('div');
    d.innerHTML = h;
    document.body.appendChild(d.firstElementChild);
};

window.openLogin = () => {
    if (!document.getElementById('loginOverlay')) window.injectLoginModal();
    document.getElementById('loginOverlay').style.display = 'flex';
};

window.closeLogin = () => {
    const el = document.getElementById('loginOverlay');
    if(el) el.style.display = 'none';
};

window.switchTab = (tab) => {
    const isSignin = tab === 'signin';
    document.getElementById('panel-signin').style.display = isSignin ? 'block' : 'none';
    document.getElementById('panel-register').style.display = isSignin ? 'none' : 'block';
    document.getElementById('tab-signin-btn').style.background = isSignin ? '#1e2d28' : 'transparent';
    document.getElementById('tab-signin-btn').style.color = isSignin ? 'white' : 'rgba(255,255,255,0.4)';
    document.getElementById('tab-register-btn').style.background = !isSignin ? '#1e2d28' : 'transparent';
    document.getElementById('tab-register-btn').style.color = !isSignin ? 'white' : 'rgba(255,255,255,0.4)';
};

window.toggleDropdown = () => {
    document.getElementById('profileDropdown')?.classList.toggle('open');
};

if (document.readyState !== 'loading') { window.injectLoginModal(); }
else { document.addEventListener('DOMContentLoaded', window.injectLoginModal); }
