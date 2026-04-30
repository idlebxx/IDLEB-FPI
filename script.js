// ---------- SYSTEM STATE ----------
let currentUser = null;
let criminals = JSON.parse(localStorage.getItem('idleb_criminals')) || [];
let identityDB = JSON.parse(localStorage.getItem('idleb_identities')) || [];
let auditLog = JSON.parse(localStorage.getItem('idleb_audit')) || [];
let users = JSON.parse(localStorage.getItem('idleb_users')) || [];

// Seed default admin if none
if(users.length === 0){
    users.push({id:1, fullname:"System Admin", username:"admin", password:"admin123", role:"admin"});
    users.push({id:2, fullname:"Officer Ali", username:"officer", password:"pass", role:"officer"});
    localStorage.setItem('idleb_users', JSON.stringify(users));
}

function addLog(action, details){
    auditLog.unshift({timestamp: new Date().toISOString(), user: currentUser?.username || "guest", action, details});
    localStorage.setItem('idleb_audit', JSON.stringify(auditLog.slice(0,200)));
}

function saveCriminals(){ localStorage.setItem('idleb_criminals', JSON.stringify(criminals)); }
function saveIdentities(){ localStorage.setItem('idleb_identities', JSON.stringify(identityDB)); }

// ---------- UI RENDER ----------
function renderPage(page){
    const container = document.getElementById('mainContent');
    if(!container) return;
    if(page === 'home') renderHome(container);
    else if(page === 'dashboard') renderDashboard(container);
    else if(page === 'database') renderDatabase(container);
    else if(page === 'audit') renderAudit(container);
    else renderHome(container);
}

function renderHome(container){
    container.innerHTML = `
        <section class="hero">
            <h2>IDLEB FPI National AI System</h2>
            <p>Complete user roles, database, and AI sketch integration.</p>
            <div class="hero-stats">
                <div class="stat"><span>${criminals.length}</span><p>Criminals</p></div>
                <div class="stat"><span>${identityDB.length}</span><p>Identities</p></div>
                <div class="stat"><span>${auditLog.length}</span><p>Audits</p></div>
            </div>
        </section>
        <section class="features">
            <div class="section-title"><h3>AI Sketch Demo</h3></div>
            <div class="demo-container">
                <input type="text" id="descInput" placeholder="Describe criminal...">
                <button id="generateBtn">Generate AI Face</button>
                <div id="faceResult" class="face-placeholder"><i class="fas fa-user-secret"></i> Sketch appears here</div>
            </div>
        </section>
    `;
    const genBtn = document.getElementById('generateBtn');
    if(genBtn){
        genBtn.onclick = () => {
            const desc = document.getElementById('descInput')?.value || "unknown";
            const imgUrl = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random()*90)}.jpg`;
            document.getElementById('faceResult').innerHTML = `<img src="${imgUrl}" style="width:150px; border-radius:50%;"> <br> Generated from: ${desc}`;
            addLog("AI_SKETCH", `Generated from: ${desc}`);
        };
    }
}

function renderDashboard(container){
    if(!currentUser) { alert("Please login first"); return; }
    let canAdd = (currentUser.role === 'admin' || currentUser.role === 'officer');
    container.innerHTML = `
        <div style="padding:2rem;">
            <h2>Welcome, ${currentUser.fullname} (${currentUser.role})</h2>
            <div class="dashboard-stats">
                <div class="stat-card"><i class="fas fa-skull"></i> Criminals: ${criminals.length}</div>
                <div class="stat-card"><i class="fas fa-id-card"></i> Identities: ${identityDB.length}</div>
            </div>
            ${canAdd ? `
            <div style="background:#f1f5f9; padding:1rem; border-radius:24px;">
                <h3>➕ Add New Criminal Record</h3>
                <input id="cName" placeholder="Full name"><input id="cDesc" placeholder="Description / scars"><input id="cNationalId" placeholder="National ID (optional)">
                <button id="addCriminalBtn">Add to Database</button>
            </div>
            ` : '<p><i class="fas fa-lock"></i> Officer+ role needed to add records</p>'}
            <h3>Recent criminals list</h3>
            <table><tr><th>Name</th><th>Desc</th><th>National ID</th></tr>
            ${criminals.map(c => `<tr><td>${c.name}</td><td>${c.desc}</td><td>${c.nid || '-'}</td></tr>`).join('')}
            </table>
        </div>
    `;
    if(canAdd){
        document.getElementById('addCriminalBtn')?.addEventListener('click', () => {
            let name = document.getElementById('cName').value;
            let desc = document.getElementById('cDesc').value;
            let nid = document.getElementById('cNationalId').value;
            if(name && desc){
                criminals.push({id:Date.now(), name, desc, nid, addedBy: currentUser.username});
                saveCriminals();
                addLog("ADD_CRIMINAL", `Added ${name}`);
                renderDashboard(container);
            } else alert("Fill name and description");
        });
    }
}

function renderDatabase(container){
    if(!currentUser) { alert("Login required"); return; }
    container.innerHTML = `
        <div style="padding:2rem;">
            <h2>🔍 National Identity & Face Matching (simulated)</h2>
            <input id="searchNID" placeholder="Search by National ID"><button id="searchBtn">Search</button>
            <div id="searchResult"></div>
            <hr>
            <h3>All registered identities</h3>
            <table><tr><th>ID</th><th>Full Name</th><th>Photo</th><th>Criminal Match</th></tr>
            ${identityDB.map(id => `<tr><td>${id.nationalId}</td><td>${id.name}</td><td><img src="${id.photo}" width="40" style="border-radius:50%;"></td><td>${id.criminalMatch ? '⚠️ Wanted' : 'Clean'}</td></tr>`).join('')}
            </table>
            ${currentUser.role === 'admin' ? `<button id="seedIdentities">Seed Demo Identities</button>` : ''}
        </div>
    `;
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        let nid = document.getElementById('searchNID').value;
        let found = identityDB.find(i => i.nationalId === nid);
        document.getElementById('searchResult').innerHTML = found ? `<div style="background:#e2e8f0; padding:1rem;">✅ ${found.name} – ${found.criminalMatch ? "Flagged" : "Clear"}</div>` : "Not found";
        addLog("SEARCH_ID", nid);
    });
    if(currentUser.role === 'admin'){
        document.getElementById('seedIdentities')?.addEventListener('click', () => {
            identityDB.push({nationalId:"1001", name:"Ahmad K.", photo:"https://randomuser.me/api/portraits/men/1.jpg", criminalMatch:true});
            identityDB.push({nationalId:"2002", name:"Layla M.", photo:"https://randomuser.me/api/portraits/women/2.jpg", criminalMatch:false});
            saveIdentities();
            renderDatabase(container);
        });
    }
}

function renderAudit(container){
    if(!currentUser){ alert("Login first"); return; }
    container.innerHTML = `<div style="padding:2rem;"><h2>📜 Full Audit Log</h2><table><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr>
    ${auditLog.map(log => `<tr><td>${log.timestamp.slice(0,16)}</td><td>${log.user}</td><td>${log.action}</td><td>${log.details}</td></tr>`).join('')}
    </table></div>`;
}

// ---------- AUTH MODAL ----------
const modal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const closeSpan = document.querySelector('.close');

function showLogin(){
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    modal.style.display = 'block';
}
function showRegister(){
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    modal.style.display = 'block';
}
loginBtn.onclick = showLogin;
registerBtn.onclick = showRegister;
closeSpan.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };

document.getElementById('doLogin')?.addEventListener('click', () => {
    let user = document.getElementById('loginUsername').value;
    let pwd = document.getElementById('loginPassword').value;
    let found = users.find(u => u.username === user && u.password === pwd);
    if(found){
        currentUser = found;
        localStorage.setItem('idleb_current', JSON.stringify(currentUser));
        document.getElementById('userStatus').innerHTML = `<i class="fas fa-user-check"></i> ${currentUser.fullname} (${currentUser.role})`;
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        modal.style.display = 'none';
        addLog("LOGIN", "User logged in");
        renderPage('dashboard');
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        document.querySelector('nav a[data-page="dashboard"]').classList.add('active');
    } else alert("Invalid credentials");
});

document.getElementById('doRegister')?.addEventListener('click', () => {
    let full = document.getElementById('regFullname').value;
    let user = document.getElementById('regUsername').value;
    let pwd = document.getElementById('regPassword').value;
    let role = document.getElementById('regRole').value;
    if(full && user && pwd){
        users.push({id:Date.now(), fullname:full, username:user, password:pwd, role});
        localStorage.setItem('idleb_users', JSON.stringify(users));
        alert("Registered! You can now login.");
        modal.style.display = 'none';
    } else alert("All fields required");
});

logoutBtn.onclick = () => {
    currentUser = null;
    localStorage.removeItem('idleb_current');
    document.getElementById('userStatus').innerHTML = `<i class="fas fa-user-lock"></i> Not logged in`;
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    renderPage('home');
    addLog("LOGOUT", "User logged out");
};

// Check stored session
let stored = localStorage.getItem('idleb_current');
if(stored){
    currentUser = JSON.parse(stored);
    document.getElementById('userStatus').innerHTML = `<i class="fas fa-user-check"></i> ${currentUser.fullname} (${currentUser.role})`;
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
}

// Navigation
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        let page = link.getAttribute('data-page');
        if(page === 'dashboard' && !currentUser){ alert("Please login first"); return; }
        if(page === 'database' && !currentUser){ alert("Login required"); return; }
        if(page === 'audit' && !currentUser){ alert("Login first"); return; }
        renderPage(page);
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// Initial load
renderPage('home');
