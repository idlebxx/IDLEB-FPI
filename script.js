// ========== STATE ==========
let currentUser = null;
let criminals = JSON.parse(localStorage.getItem('idleb_criminals')) || [];
let identities = JSON.parse(localStorage.getItem('idleb_identities')) || [];
let auditLog = JSON.parse(localStorage.getItem('idleb_audit')) || [];
let users = JSON.parse(localStorage.getItem('idleb_users')) || [];

// Seed default users
if (users.length === 0) {
    users.push({ id: 1, fullname: "System Admin", username: "admin", password: "admin123", role: "admin" });
    users.push({ id: 2, fullname: "Officer Ahmed", username: "officer", password: "pass", role: "officer" });
    localStorage.setItem('idleb_users', JSON.stringify(users));
}

// Seed demo identities
if (identities.length === 0) {
    identities.push({ nationalId: "SY1001", name: "Mohammad Al Hasan", photo: "https://randomuser.me/api/portraits/men/1.jpg", criminalMatch: true });
    identities.push({ nationalId: "SY1002", name: "Fatima Al Khalil", photo: "https://randomuser.me/api/portraits/women/2.jpg", criminalMatch: false });
    localStorage.setItem('idleb_identities', JSON.stringify(identities));
}

function saveAll() {
    localStorage.setItem('idleb_criminals', JSON.stringify(criminals));
    localStorage.setItem('idleb_identities', JSON.stringify(identities));
    localStorage.setItem('idleb_audit', JSON.stringify(auditLog));
    localStorage.setItem('idleb_users', JSON.stringify(users));
}

function addLog(action, details) {
    auditLog.unshift({ timestamp: new Date().toISOString(), user: currentUser?.username || "guest", action, details });
    saveAll();
}

// ========== RENDER FUNCTIONS ==========
function renderHome() {
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in">
            <div class="stats-grid">
                <div class="stat-card-glass">
                    <div class="stat-icon"><i class="fas fa-skull-crossbones"></i></div>
                    <div class="stat-value" id="statCriminals">${criminals.length}</div>
                    <div class="stat-label">Criminals Registered</div>
                </div>
                <div class="stat-card-glass">
                    <div class="stat-icon"><i class="fas fa-id-card"></i></div>
                    <div class="stat-value" id="statIdentities">${identities.length}</div>
                    <div class="stat-label">National IDs</div>
                </div>
                <div class="stat-card-glass">
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-value" id="statMatches">${Math.floor(Math.random() * 100)}%</div>
                    <div class="stat-label">AI Match Accuracy</div>
                </div>
                <div class="stat-card-glass">
                    <div class="stat-icon"><i class="fas fa-history"></i></div>
                    <div class="stat-value">${auditLog.length}</div>
                    <div class="stat-label">Total Actions</div>
                </div>
            </div>
            <div class="table-container">
                <h3 style="color:white; margin-bottom:1rem;">📋 Recent Criminal Records</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>Name</th><th>Description</th><th>National ID</th><th>Added By</th></tr>
                    </thead>
                    <tbody>
                        ${criminals.slice(0,5).map(c => `<tr><td>${c.name}</td><td>${c.desc}</td><td>${c.nid || '-'}</td><td>${c.addedBy || 'system'}</td></tr>`).join('')}
                        ${criminals.length === 0 ? '<tr><td colspan="4" style="text-align:center">No criminals added yet</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    updateSidebarBadge();
}

function renderSketch() {
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in sketch-container">
            <h2 style="color:white; margin-bottom:1rem;">🤖 AI Composite Sketch Generator</h2>
            <div class="sketch-input-area">
                <textarea id="sketchDesc" rows="3" placeholder="Describe the suspect (e.g., male, 35, oval face, beard, scar on left cheek, deep eyes...)"></textarea>
                <button class="btn-glass" id="generateSketchBtn"><i class="fas fa-magic"></i> Generate Face</button>
            </div>
            <div class="sketch-result" id="sketchResult">
                <div style="text-align:center; color:#64748b;">
                    <i class="fas fa-user-secret" style="font-size:3rem;"></i>
                    <p>AI-generated face will appear here</p>
                </div>
            </div>
            ${currentUser ? '<p style="margin-top:1rem; color:#94a3b8; font-size:0.8rem;"><i class="fas fa-lock"></i> This action is logged for security audit</p>' : '<p style="margin-top:1rem; color:#facc15;"><i class="fas fa-exclamation-triangle"></i> Please login to use this feature</p>'}
        </div>
    `;
    
    document.getElementById('generateSketchBtn')?.addEventListener('click', () => {
        if (!currentUser) { alert('Please login first'); return; }
        const desc = document.getElementById('sketchDesc')?.value || "Unknown suspect";
        const randomId = Math.floor(Math.random() * 90);
        const imgUrl = `https://randomuser.me/api/portraits/men/${randomId}.jpg`;
        document.getElementById('sketchResult').innerHTML = `
            <img src="${imgUrl}" style="width:200px; height:200px; border-radius:50%; border:3px solid #facc15; object-fit:cover;">
            <p style="margin-top:1rem; color:#2563eb;">Generated from: "${desc.substring(0, 50)}..."</p>
        `;
        addLog("AI_SKETCH", `Generated face from: ${desc.substring(0, 100)}`);
    });
}

function renderDatabase() {
    if (!currentUser) { alert('Please login first'); return; }
    const canAdd = currentUser.role === 'admin' || currentUser.role === 'officer';
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in">
            <div class="table-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="color:white;">👮 Criminal Database</h3>
                    ${canAdd ? '<button class="btn-glass" id="showAddCriminalForm"><i class="fas fa-plus"></i> Add Criminal</button>' : ''}
                </div>
                <div id="addCriminalFormContainer" style="display:none; margin-bottom:1rem; padding:1rem; background:rgba(0,0,0,0.3); border-radius:16px;">
                    <input type="text" id="newCriminalName" placeholder="Full Name" style="width:100%; padding:0.5rem; margin-bottom:0.5rem; background:#0f172a; border:1px solid #2563eb; border-radius:8px; color:white;">
                    <input type="text" id="newCriminalDesc" placeholder="Description / Features" style="width:100%; padding:0.5rem; margin-bottom:0.5rem; background:#0f172a; border:1px solid #2563eb; border-radius:8px; color:white;">
                    <input type="text" id="newCriminalNid" placeholder="National ID (optional)" style="width:100%; padding:0.5rem; margin-bottom:0.5rem; background:#0f172a; border:1px solid #2563eb; border-radius:8px; color:white;">
                    <button class="btn-glass" id="saveNewCriminal">Save Criminal</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Description</th><th>National ID</th><th>Added By</th>${currentUser.role === 'admin' ? '<th>Actions</th>' : ''}</tr></thead>
                    <tbody>
                        ${criminals.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.desc}</td>
                                <td>${c.nid || '-'}</td>
                                <td>${c.addedBy || 'system'}</td>
                                ${currentUser.role === 'admin' ? `<td><button class="btn-glass-outline" onclick="deleteCriminal(${c.id})" style="padding:0.2rem 0.8rem;">Delete</button></td>` : ''}
                            </tr>
                        `).join('')}
                        ${criminals.length === 0 ? '<tr><td colspan="5" style="text-align:center">No criminals in database</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('showAddCriminalForm')?.addEventListener('click', () => {
        const container = document.getElementById('addCriminalFormContainer');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('saveNewCriminal')?.addEventListener('click', () => {
        const name = document.getElementById('newCriminalName').value;
        const desc = document.getElementById('newCriminalDesc').value;
        const nid = document.getElementById('newCriminalNid').value;
        if (name && desc) {
            criminals.push({ id: Date.now(), name, desc, nid, addedBy: currentUser.username });
            saveAll();
            addLog("ADD_CRIMINAL", `Added criminal: ${name}`);
            renderDatabase();
        } else alert("Please fill name and description");
    });
}

function renderIdentities() {
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in">
            <div class="table-container">
                <h3 style="color:white; margin-bottom:1rem;">🆔 National Identity Database</h3>
                <div style="margin-bottom:1rem; display:flex; gap:0.5rem;">
                    <input type="text" id="searchNid" placeholder="Search by National ID" style="flex:1; padding:0.5rem; background:#0f172a; border:1px solid #2563eb; border-radius:8px; color:white;">
                    <button class="btn-glass" id="searchNidBtn">Search</button>
                </div>
                <div id="searchResult"></div>
                <table class="data-table">
                    <thead><tr><th>National ID</th><th>Full Name</th><th>Photo</th><th>Status</th></tr></thead>
                    <tbody>
                        ${identities.map(id => `
                            <tr>
                                <td>${id.nationalId}</td>
                                <td>${id.name}</td>
                                <td><img src="${id.photo}" width="40" style="border-radius:50%;"></td>
                                <td><span style="color:${id.criminalMatch ? '#ef4444' : '#22c55e'}">${id.criminalMatch ? '⚠️ Flagged' : '✓ Clean'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn-glass-outline" id="seedMoreIds" style="margin-top:1rem;"><i class="fas fa-database"></i> Seed Demo IDs</button>
            </div>
        </div>
    `;
    
    document.getElementById('searchNidBtn')?.addEventListener('click', () => {
        const nid = document.getElementById('searchNid').value;
        const found = identities.find(i => i.nationalId === nid);
        const resultDiv = document.getElementById('searchResult');
        if (found) {
            resultDiv.innerHTML = `<div style="background:rgba(37,99,235,0.2); padding:1rem; border-radius:12px; margin-bottom:1rem;">
                ✅ Found: ${found.name} - ${found.criminalMatch ? '⚠️ Wanted' : 'Clean'}
            </div>`;
            addLog("SEARCH_ID", `Searched NID: ${nid}`);
        } else {
            resultDiv.innerHTML = `<div style="background:rgba(220,38,38,0.2); padding:1rem; border-radius:12px; margin-bottom:1rem;">❌ No identity found with ID: ${nid}</div>`;
        }
    });
    
    document.getElementById('seedMoreIds')?.addEventListener('click', () => {
        identities.push({ nationalId: "SY" + (1000 + identities.length), name: "Demo User " + (identities.length + 1), photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 90)}.jpg`, criminalMatch: Math.random() > 0.7 });
        saveAll();
        renderIdentities();
        addLog("SEED_DATA", "Added demo identity");
    });
}

function renderAudit() {
    if (!currentUser) { alert('Please login first'); return; }
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in">
            <div class="table-container">
                <h3 style="color:white; margin-bottom:1rem;">📜 Audit Log (${auditLog.length} records)</h3>
                <table class="data-table">
                    <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
                    <tbody>
                        ${auditLog.map(log => `<tr><td>${new Date(log.timestamp).toLocaleString()}</td><td>${log.user}</td><td>${log.action}</td><td>${log.details}</td></tr>`).join('')}
                        ${auditLog.length === 0 ? '<tr><td colspan="4" style="text-align:center">No logs yet</td></tr>' : ''}
                    </tbody>
                </table>
                <button class="btn-glass-outline" id="clearAuditLog" style="margin-top:1rem;"><i class="fas fa-trash"></i> Clear Logs (Admin Only)</button>
            </div>
        </div>
    `;
    
    if (currentUser?.role === 'admin') {
        document.getElementById('clearAuditLog')?.addEventListener('click', () => {
            if (confirm('Clear all audit logs?')) {
                auditLog = [];
                saveAll();
                renderAudit();
                addLog("CLEAR_LOGS", "Audit log cleared by admin");
            }
        });
    }
}

function renderAnalytics() {
    const content = document.getElementById('dynamicContent');
    content.innerHTML = `
        <div class="fade-in">
            <div class="stats-grid">
                <div class="stat-card-glass"><div class="stat-icon"><i class="fas fa-chart-bar"></i></div><div class="stat-value">${criminals.length}</div><div class="stat-label">Total Criminals</div></div>
                <div class="stat-card-glass"><div class="stat-icon"><i class="fas fa-chart-pie"></i></div><div class="stat-value">${identities.filter(i => i.criminalMatch).length}</div><div class="stat-label">Flagged Identities</div></div>
                <div class="stat-card-glass"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-value">${auditLog.length}</div><div class="stat-label">Total Actions</div></div>
            </div>
            <div class="table-container">
                <h3 style="color:white;">📊 System Overview</h3>
                <canvas id="analyticsChart" style="max-height:300px; width:100%;"></canvas>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('analyticsChart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: { labels: ['Criminals', 'Clean Identities', 'Flagged IDs'], datasets: [{ data: [criminals.length, identities.filter(i => !i.criminalMatch).length, identities.filter(i => i.criminalMatch).length], backgroundColor: ['#2563eb', '#22c55e', '#ef4444'] }] }
            });
        }
    }, 100);
}

function updateSidebarBadge() {
    const badge = document.getElementById('criminalCount');
    if (badge) badge.textContent = criminals.length;
}

// ========== AUTH & NAVIGATION ==========
const modal = document.getElementById('glassModal');
const modalLoginForm = document.getElementById('modalLoginForm');
const modalRegisterForm = document.getElementById('modalRegisterForm');

function showModalLogin() {
    modalLoginForm.style.display = 'block';
    modalRegisterForm.style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Login to IDLEB FPI';
    modal.style.display = 'flex';
}

document.getElementById('sidebarLoginBtn')?.addEventListener('click', showModalLogin);
document.querySelector('.modal-close')?.addEventListener('click', () => modal.style.display = 'none');
document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    modalLoginForm.style.display = 'none';
    modalRegisterForm.style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Create Account';
});
document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    modalLoginForm.style.display = 'block';
    modalRegisterForm.style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Login to IDLEB FPI';
});

document.getElementById('modalLoginBtn')?.addEventListener('click', () => {
    const username = document.getElementById('modalUsername').value;
    const password = document.getElementById('modalPassword').value;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('idleb_current', JSON.stringify(currentUser));
        document.getElementById('userNameDisplay').textContent = user.fullname;
        document.getElementById('userRoleDisplay').textContent = user.role;
        document.getElementById('sidebarLoginBtn').style.display = 'none';
        document.getElementById('sidebarLogoutBtn').style.display = 'block';
        modal.style.display = 'none';
        addLog("LOGIN", "User logged in");
        renderHome();
    } else {
        document.getElementById('modalMessage').textContent = 'Invalid credentials';
    }
});

document.getElementById('modalRegisterBtn')?.addEventListener('click', () => {
    const fullname = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRoleSelect').value;
    if (fullname && username && password) {
        users.push({ id: Date.now(), fullname, username, password, role });
        saveAll();
        alert('Registration successful! Please login.');
        showModalLogin();
    } else {
        document.getElementById('modalMessage').textContent = 'All fields required';
    }
});

document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('idleb_current');
    document.getElementById('userNameDisplay').textContent = 'Guest';
    document.getElementById('userRoleDisplay').textContent = 'Not logged in';
    document.getElementById('sidebarLoginBtn').style.display = 'block';
    document.getElementById('sidebarLogoutBtn').style.display = 'none';
    addLog("LOGOUT", "User logged out");
    renderHome();
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const titles = { home: 'Intelligence Dashboard', sketch: 'AI Sketch Generator', database: 'Criminal Database', identities: 'National IDs', audit: 'Audit Log', analytics: 'System Analytics' };
        document.getElementById('pageTitle').textContent = titles[page] || 'IDLEB FPI';
        document.getElementById('pageSubtitle').textContent = page === 'home' ? 'Real-time criminal identification system' : 'Access controlled • Secured by IDLEB FPI';
        
        if (page === 'home') renderHome();
        else if (page === 'sketch') renderSketch();
        else if (page === 'database') renderDatabase();
        else if (page === 'identities') renderIdentities();
        else if (page === 'audit') renderAudit();
        else if (page === 'analytics') renderAnalytics();
    });
});

// Theme Toggle
let darkMode = true;
document.getElementById('themeToggle')?.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.style.background = darkMode ? '#0a0a0a' : '#f0f4f8';
    const style = document.createElement('style');
    style.textContent = darkMode ? '' : 'body { background: #f0f4f8; } .stat-card-glass, .table-container, .sketch-container { background: rgba(255,255,255,0.9); color: #0f172a; }';
    document.head.appendChild(style);
});

// Global Search
document.getElementById('globalSearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = criminals.filter(c => c.name.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));
    if (filtered.length && document.querySelector('.data-table')) {
        const tbody = document.querySelector('.data-table tbody');
        if (tbody) {
            tbody.innerHTML = filtered.map(c => `<tr><td>${c.name}</td><td>${c.desc}</td><td>${c.nid || '-'}</td><td>${c.addedBy || 'system'}</td></tr>`).join('');
        }
    }
});

// Restore session
const storedUser = localStorage.getItem('idleb_current');
if (storedUser) {
    currentUser = JSON.parse(storedUser);
    document.getElementById('userNameDisplay').textContent = currentUser.fullname;
    document.getElementById('userRoleDisplay').textContent = currentUser.role;
    document.getElementById('sidebarLoginBtn').style.display = 'none';
    document.getElementById('sidebarLogoutBtn').style.display = 'block';
}

renderHome();
window.deleteCriminal = (id) => {
    if (currentUser?.role === 'admin') {
        criminals = criminals.filter(c => c.id !== id);
        saveAll();
        addLog("DELETE_CRIMINAL", `Deleted criminal ID: ${id}`);
        renderDatabase();
    }
};
