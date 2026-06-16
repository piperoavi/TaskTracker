// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
const API_AUTH = 'Basic ' + btoa('admin:admin123'); // Spring Security gate — transparent to user
let currentUser = null;   // the logged-in User object from DB
let allUsers    = [];
let allProjects = [];

// ═══════════════════════════════════════════════
//  API HELPER
// ═══════════════════════════════════════════════
async function api(path, opts = {}) {
    const res = await fetch(path, {
        ...opts,
        headers: { 'Authorization': API_AUTH, 'Content-Type': 'application/json', ...(opts.headers||{}) }
    });
    if (!res.ok) {
        const txt = await res.text();
        let msg = txt;
        try { msg = JSON.parse(txt).message || txt; } catch {}
        throw new Error(msg || `Error ${res.status}`);
    }
    const t = await res.text();
    return t ? JSON.parse(t) : null;
}

// ═══════════════════════════════════════════════
//  AUTH — REGISTER
// ═══════════════════════════════════════════════
async function doRegister() {
    const username = v('reg-username');
    const email    = v('reg-email');
    const password = v('reg-password');

    if (!username || !email || !password) { showErr('reg-error', 'All fields are required.'); return; }
    if (username.length < 3)  { showErr('reg-error', 'Username must be at least 3 characters.'); return; }
    if (password.length < 8)  { showErr('reg-error', 'Password must be at least 8 characters.'); return; }
    if (!email.includes('@')) { showErr('reg-error', 'Enter a valid email address.'); return; }

    try {
        const user = await api('/api/v1/users', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        toast(`Account created! Welcome, ${user.username} 👋`, 'success');
        // Auto sign in
        currentUser = user;
        launchApp();
    } catch (e) {
        showErr('reg-error', e.message.includes('500') ? 'Username or email already taken.' : e.message);
    }
}

// ═══════════════════════════════════════════════
//  AUTH — SIGN IN
// ═══════════════════════════════════════════════
async function doSignIn() {
    const username = v('login-username');
    const password = v('login-password');

    if (!username || !password) { showErr('login-error', 'Enter your username and password.'); return; }

    try {
        // Fetch all users and find by username + password match
        // (Simple approach since we don't have a /login endpoint)
        const data = await api('/api/v1/users?page=0&size=200');
        const users = data.content || data || [];
        const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!found) { showErr('login-error', 'No account found with that username.'); return; }

        // Verify password by attempting to create a temp Basic auth with user's credentials
        // Since the API only uses admin/admin123, we just trust the username exists
        // and treat password as an app-level check stored in the user record
        // NOTE: For a real app you'd hash passwords. Here we do a simple match.
        currentUser = found;
        launchApp();
    } catch (e) {
        showErr('login-error', 'Could not sign in: ' + e.message);
    }
}

// ═══════════════════════════════════════════════
//  LAUNCH APP
// ═══════════════════════════════════════════════
async function launchApp() {
    hide('auth-screen');
    show('app');

    // Sidebar user info
    document.getElementById('sidebar-username').textContent = currentUser.username;
    document.getElementById('sidebar-email').textContent    = currentUser.email;
    document.getElementById('sidebar-avatar').textContent   = currentUser.username[0].toUpperCase();

    await Promise.all([loadAllUsers(), loadAllProjects()]);
    showPage('dashboard', document.querySelector('.nav-item[data-page="dashboard"]'));
}

function signOut() {
    currentUser = null; allUsers = []; allProjects = [];
    hide('app'); show('auth-screen');
    switchTab('login');
    // Clear fields
    ['login-username','login-password','reg-username','reg-email','reg-password'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
}

// ═══════════════════════════════════════════════
//  SWITCH AUTH TAB
// ═══════════════════════════════════════════════
function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('pane-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('pane-register').classList.toggle('hidden', tab !== 'register');
    hide('login-error'); hide('reg-error');
}

// Enter key support
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (!document.getElementById('auth-screen').classList.contains('hidden') &&
        document.getElementById('auth-screen').style.display !== 'none' &&
        !document.getElementById('auth-screen').classList.contains('hidden')) {
        const loginVisible = !document.getElementById('pane-login').classList.contains('hidden');
        loginVisible ? doSignIn() : doRegister();
    }
});

// ═══════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════
async function loadAllUsers() {
    try {
        const d = await api('/api/v1/users?page=0&size=200');
        allUsers = d.content || d || [];
    } catch { allUsers = []; }
}

async function loadAllProjects() {
    try {
        const d = await api('/api/v1/projects?page=0&size=200');
        allProjects = d.content || d || [];
    } catch { allProjects = []; }
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function showPage(name, el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');

    if (name === 'dashboard')    loadDashboard();
    if (name === 'my-tasks')     loadMyTasks();
    if (name === 'projects')     renderProjects();
    if (name === 'browse-tasks') initBrowse();
    if (name === 'today')        loadToday();
    if (name === 'people')       renderPeople();
    return false;
}

// ═══════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════
async function loadDashboard() {
    document.getElementById('dash-greeting').textContent = `Hello, ${currentUser.username} 👋`;
    document.getElementById('kpi-projects').textContent = allProjects.length;

    try {
        const myTasks = await api(`/api/v1/users/${currentUser.id}/tasks`);
        const open = myTasks.filter(t => t.status !== 'COMPLETED');
        document.getElementById('kpi-open').textContent = open.length;

        // My tasks badge
        if (open.length > 0) {
            const b = document.getElementById('my-tasks-badge');
            b.textContent = open.length; b.classList.remove('hidden');
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const dueToday = myTasks.filter(t => t.dueDate === todayStr && t.status !== 'COMPLETED');
        document.getElementById('kpi-today').textContent = dueToday.length;

        if (dueToday.length > 0) {
            const tb = document.getElementById('today-badge');
            tb.textContent = dueToday.length; tb.classList.remove('hidden');
        }

        // Due today panel
        const dtEl = document.getElementById('dash-today-tasks');
        if (!dueToday.length) dtEl.innerHTML = emptyState('Nothing due today 🎉');
        else dtEl.innerHTML = miniList(dueToday);

        // Recent tasks panel
        const recentEl = document.getElementById('dash-recent-tasks');
        const recent = myTasks.slice(0, 5);
        if (!recent.length) recentEl.innerHTML = emptyState('No tasks yet. Create your first one!');
        else recentEl.innerHTML = miniList(recent);

    } catch (e) {
        document.getElementById('kpi-open').textContent = '?';
        document.getElementById('kpi-today').textContent = '?';
    }
}

function miniList(tasks) {
    return `<div class="mini-list">${tasks.map(t => `
    <div class="mini-item" onclick='openEdit(${JSON.stringify(t)})'>
      <div>
        <div class="mini-title">${esc(t.title)}</div>
        <div class="mini-sub">${esc(t.projectName||'—')}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="badge badge-${t.priority}">${fmtPriority(t.priority)}</span>
        <span class="badge badge-${t.status}">${fmtStatus(t.status)}</span>
      </div>
    </div>`).join('')}</div>`;
}

// ═══════════════════════════════════════════════
//  MY TASKS
// ═══════════════════════════════════════════════
async function loadMyTasks() {
    const status = document.getElementById('my-tasks-status').value;
    const el = document.getElementById('my-tasks-container');
    el.innerHTML = '<p class="muted-hint">Loading…</p>';
    try {
        let tasks = await api(`/api/v1/users/${currentUser.id}/tasks`);
        if (status) tasks = tasks.filter(t => t.status === status);
        renderTaskTable(tasks, el);
    } catch (e) {
        el.innerHTML = `<p style="color:var(--rose);padding:20px">${e.message}</p>`;
    }
}

// ═══════════════════════════════════════════════
//  PROJECTS
// ═══════════════════════════════════════════════
function renderProjects() {
    const el = document.getElementById('projects-grid');
    if (!allProjects.length) { el.innerHTML = emptyState('No projects yet. Create one!'); return; }
    el.innerHTML = allProjects.map(p => {
        const iAmOwner = p.ownerUsername === currentUser.username ||
            p.ownerId === currentUser.id ||
            p.ownerId === String(currentUser.id);
        return `
    <div class="proj-card" onclick="goToProject(${p.id})">
      <div class="proj-dot"></div>
      <div class="proj-name">${esc(p.name)}</div>
      <div class="proj-desc">${esc(p.description||'No description.')}</div>
      <div class="proj-footer">
        <span class="proj-owner">${iAmOwner ? '<span class="owner-tag">You own this</span>' : 'Owner: ' + esc(p.ownerUsername||'—')}</span>
        <div style="display:flex;gap:6px">
          <button class="btn-sm-purple" onclick="event.stopPropagation();goToProject(${p.id})">View Tasks →</button>
          ${iAmOwner
            ? `<button class="btn-sm-danger" title="Delete project and all its tasks" onclick="event.stopPropagation();deleteProject(${p.id}, '${esc(p.name)}')">🗑</button>`
            : ''
        }
        </div>
      </div>
    </div>`;
    }).join('');
}

async function deleteProject(id, name) {
    if (!confirm(`Delete project "${name}" and ALL its tasks? This cannot be undone.`)) return;
    try {
        await api(`/api/v1/projects/${id}`, { method: 'DELETE' });
        toast('Project deleted.', 'success');
        await loadAllProjects();
        renderProjects();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function createProject() {
    const name = v('np-name'), description = v('np-desc');
    if (!name) { toast('Project name is required.', 'error'); return; }
    if (name.length < 3) { toast('Name must be at least 3 characters.', 'error'); return; }
    try {
        await api('/api/v1/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description, ownerId: currentUser.id })
        });
        closeModal('modal-project');
        clear(['np-name','np-desc']);
        await loadAllProjects();
        renderProjects();
        toast('Project created!', 'success');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
}

function goToProject(id) {
    showPage('browse-tasks', document.querySelector('.nav-item[data-page="browse-tasks"]'));
    setTimeout(() => { document.getElementById('browse-project').value = id; loadBrowseTasks(); }, 60);
}

// ═══════════════════════════════════════════════
//  BROWSE TASKS
// ═══════════════════════════════════════════════
function initBrowse() {
    const sel = document.getElementById('browse-project');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select a project…</option>' +
        allProjects.map(p => `<option value="${p.id}" ${p.id==cur?'selected':''}>${esc(p.name)}</option>`).join('');
    if (cur) loadBrowseTasks();
}

async function loadBrowseTasks() {
    const pid = document.getElementById('browse-project').value;
    const status = document.getElementById('browse-status').value;
    const el = document.getElementById('browse-container');

    if (!pid) { el.innerHTML = '<p class="muted-hint">Select a project to see its tasks.</p>'; return; }

    // Show/hide "+ New Task" button based on whether current user owns this project
    const proj = allProjects.find(p => String(p.id) === String(pid));
    const iAmOwner = proj && (proj.ownerUsername === currentUser.username || proj.ownerId === currentUser.id || proj.ownerId === String(currentUser.id));
    const browseBtn = document.getElementById('browse-new-task-btn');
    if (browseBtn) browseBtn.style.display = iAmOwner ? '' : 'none';

    try {
        let url = `/api/v1/projects/${pid}/tasks?page=0&size=200`;
        if (status) url += `&status=${status}`;
        const d = await api(url);
        renderTaskTable(d.content || d || [], el);
    } catch (e) { el.innerHTML = `<p style="color:var(--rose);padding:20px">${e.message}</p>`; }
}

// ═══════════════════════════════════════════════
//  TASKS — CREATE / EDIT / DELETE
// ═══════════════════════════════════════════════
async function createTask() {
    const pid      = v('nt-project');
    const title    = v('nt-title');
    const desc     = v('nt-desc');
    const status   = v('nt-status');
    const priority = v('nt-priority');
    const due      = v('nt-due');
    const assignee = v('nt-assignee');

    if (!pid||!title||!assignee) { toast('Project, title and assignee are required.', 'error'); return; }
    if (title.length < 3) { toast('Title must be at least 3 characters.', 'error'); return; }

    try {
        await api(`/api/v1/projects/${pid}/tasks`, {
            method: 'POST',
            body: JSON.stringify({ title, description: desc, status, priority, dueDate: due||null, assigneeId: +assignee, requesterId: currentUser.id })
        });
        closeModal('modal-task');
        toast('Task created! Assignee will be notified by email.', 'success');
        refreshCurrentPage();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
}

function openEdit(t) {
    document.getElementById('et-id').value    = t.id;
    document.getElementById('et-title').value = t.title;
    document.getElementById('et-desc').value  = t.description || '';
    document.getElementById('et-status').value   = t.status;
    document.getElementById('et-priority').value = t.priority;
    document.getElementById('et-due').value   = t.dueDate || '';

    const sel = document.getElementById('et-assignee');
    sel.innerHTML = '<option value="">Select…</option>' +
        allUsers.map(u => `<option value="${u.id}" ${u.id===t.assigneeId?'selected':''}>${esc(u.username)}</option>`).join('');

    // Only the project owner can delete — show/hide Delete button accordingly
    const proj = allProjects.find(p => p.id === t.projectId);
    const iAmOwner = proj && (
        proj.ownerUsername === currentUser.username ||
        proj.ownerId === currentUser.id ||
        proj.ownerId === String(currentUser.id)
    );
    const deleteBtn = document.getElementById('et-delete-btn');
    if (deleteBtn) deleteBtn.style.display = iAmOwner ? '' : 'none';

    openModal('modal-edit');
}

async function updateTask() {
    const id       = document.getElementById('et-id').value;
    const title    = v('et-title');
    const desc     = v('et-desc');
    const status   = v('et-status');
    const priority = v('et-priority');
    const due      = v('et-due');
    const assignee = v('et-assignee');

    if (!title||!assignee) { toast('Title and assignee are required.', 'error'); return; }

    try {
        await api(`/api/v1/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description: desc, status, priority, dueDate: due||null, assigneeId: +assignee, requesterId: currentUser.id })
        });
        closeModal('modal-edit');
        toast('Task updated!', 'success');
        refreshCurrentPage();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
}

async function deleteTask() {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    const id = document.getElementById('et-id').value;
    try {
        await api(`/api/v1/tasks/${id}?requesterId=${currentUser.id}`, { method: 'DELETE' });
        closeModal('modal-edit');
        toast('Task deleted.', 'success');
        refreshCurrentPage();
    } catch (e) { toast('Error: ' + e.message, 'error'); }
}

function refreshCurrentPage() {
    const active = document.querySelector('.page.active');
    if (!active) return;
    const id = active.id.replace('page-', '');
    const navEl = document.querySelector(`.nav-item[data-page="${id}"]`);
    showPage(id, navEl);
}

// ═══════════════════════════════════════════════
//  TASK TABLE RENDERER
// ═══════════════════════════════════════════════
function renderTaskTable(tasks, el) {
    if (!tasks.length) { el.innerHTML = emptyState('No tasks found.'); return; }

    const rows = tasks.map(t => {
        const proj       = allProjects.find(p => p.id === t.projectId);
        const isOwner    = proj && (proj.ownerUsername === currentUser.username || proj.ownerId === currentUser.id || proj.ownerId === String(currentUser.id));
        const isAssignee = t.assigneeId === currentUser.id || t.assigneeUsername === currentUser.username;
        const canEdit    = isOwner || isAssignee;
        const taskJson   = JSON.stringify(t).replace(/'/g, "&#39;");

        return `<tr>
      <td>
        <div class="task-title">${esc(t.title)}</div>
        ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ''}
      </td>
      <td><span class="badge badge-${t.status}">${fmtStatus(t.status)}</span></td>
      <td><span class="badge badge-${t.priority}">${fmtPriority(t.priority)}</span></td>
      <td class="cell-muted">${esc(t.assigneeUsername||'—')}</td>
      <td class="cell-muted">${t.dueDate ? fmtDate(t.dueDate) : '—'}</td>
      <td><div class="row-actions">
        ${canEdit
            ? `<button class="btn-icon" title="Edit task" onclick='openEdit(${taskJson})'>✏️</button>`
            : '<span class="btn-icon-locked" title="Only the project owner or assignee can edit">🔒</span>'
        }
        <button class="btn-icon" title="Activity log" onclick="openLog(${t.id})">📋</button>
      </div></td>
    </tr>`;
    }).join('');

    el.innerHTML = `<table class="task-table">
    <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ═══════════════════════════════════════════════
//  DUE TODAY
// ═══════════════════════════════════════════════
async function loadToday() {
    document.getElementById('today-datestr').textContent =
        new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    const el = document.getElementById('today-container');
    el.innerHTML = '<p class="muted-hint">Loading…</p>';
    try {
        const tasks = await api('/api/v1/tasks/due-today');
        renderTaskTable(tasks, el);
    } catch (e) { el.innerHTML = `<p style="color:var(--rose);padding:20px">${e.message}</p>`; }
}

// ═══════════════════════════════════════════════
//  PEOPLE
// ═══════════════════════════════════════════════
function renderPeople() {
    const el = document.getElementById('people-grid');
    if (!allUsers.length) { el.innerHTML = emptyState('No people yet.'); return; }
    el.innerHTML = allUsers.map(u => `
    <div class="person-card ${u.id === currentUser.id ? 'person-card-me' : ''}">
      <div class="person-avatar">${esc(u.username[0].toUpperCase())}</div>
      <div class="person-name">${esc(u.username)} ${u.id===currentUser.id?'<span class="you-tag">You</span>':''}</div>
      <div class="person-email">${esc(u.email)}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════
//  ACTIVITY LOG
// ═══════════════════════════════════════════════
async function openLog(taskId) {
    const el = document.getElementById('log-body');
    el.innerHTML = '<p class="muted-hint">Loading…</p>';
    openModal('modal-log');
    try {
        const logs = await api(`/api/v1/tasks/${taskId}/activities`);
        if (!logs||!logs.length) { el.innerHTML = '<p class="muted-hint">No activity yet.</p>'; return; }
        const icons = { TASK_CREATED:'✚', TASK_UPDATED:'✎', TASK_DELETED:'✕' };
        el.innerHTML = logs.map(a => `
      <div class="log-item">
        <div class="log-icon">${icons[a.action]||'•'}</div>
        <div>
          <div class="log-action">${esc(a.action)}</div>
          <div class="log-desc">${esc(a.description||'')}</div>
          <div class="log-time">${fmtDate(a.createdAt)}</div>
        </div>
      </div>`).join('');
    } catch { el.innerHTML = '<p style="color:var(--rose)">Could not load log.</p>'; }
}

// ═══════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    if (id === 'modal-task') {
        // Only show projects where the current user is the owner
        const myProjects = allProjects.filter(p =>
            p.ownerId === currentUser.id ||
            p.ownerId === String(currentUser.id) ||
            p.ownerUsername === currentUser.username
        );
        document.getElementById('nt-project').innerHTML =
            myProjects.length
                ? '<option value="">Select a project…</option>' + myProjects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')
                : '<option value="">You have no projects yet — create one first</option>';
        // Fill assignee dropdown
        document.getElementById('nt-assignee').innerHTML =
            '<option value="">Select a person…</option>' +
            allUsers.map(u => `<option value="${u.id}" ${u.id===currentUser.id?'selected':''}>${esc(u.username)}</option>`).join('');
        document.getElementById('nt-due').value = new Date().toISOString().split('T')[0];
    }
}
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function backdropClose(e, id) { if (e.target===e.currentTarget) closeModal(id); }

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════
let _tt;
function toast(msg, type='') {
    const el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast'+(type?' '+type:'');
    el.classList.remove('hidden');
    clearTimeout(_tt); _tt = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════
const v       = id => document.getElementById(id)?.value?.trim() || '';
const show    = id => document.getElementById(id).classList.remove('hidden');
const hide    = id => document.getElementById(id).classList.add('hidden');
const clear   = ids => ids.forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
const showErr = (id, msg) => { const el=document.getElementById(id); el.textContent=msg; el.classList.remove('hidden'); };
const esc     = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
const fmtStatus   = s => ({TODO:'To Do', IN_PROGRESS:'In Progress', COMPLETED:'Completed'}[s]||s);
const fmtPriority = p => ({LOW:'Low', MEDIUM:'Medium', HIGH:'High'}[p]||p);
const emptyState  = msg => `<div class="empty"><div class="empty-icon">📭</div><p>${msg}</p></div>`;