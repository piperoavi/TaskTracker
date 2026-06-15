// =============================================
//  GLOBAL STATE
// =============================================
let AUTH = '';
let allUsers = [];
let allProjects = [];

// =============================================
//  AUTH
// =============================================
function doLogin() {
    const user = document.getElementById('auth-username').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    if (!user || !pass) { showLoginError('Please enter username and password.'); return; }

    AUTH = 'Basic ' + btoa(user + ':' + pass);

    // Test credentials
    apiFetch('/api/v1/users?page=0&size=1')
        .then(() => {
            document.getElementById('login-overlay').classList.remove('active');
            document.getElementById('app').classList.remove('hidden');
            document.getElementById('app').classList.add('show');
            initApp();
        })
        .catch(() => {
            AUTH = '';
            showLoginError('Invalid credentials. Try admin / admin123.');
        });
}

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function signOut() {
    AUTH = '';
    document.getElementById('login-overlay').classList.add('active');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('app').classList.remove('show');
}

// Allow Enter key on login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('login-overlay').classList.contains('active')) {
        doLogin();
    }
});

// =============================================
//  API HELPER
// =============================================
async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
        ...options,
        headers: {
            'Authorization': AUTH,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// =============================================
//  INIT
// =============================================
async function initApp() {
    await Promise.all([loadUsersData(), loadProjectsData()]);
    showPage('dashboard', document.querySelector('.nav-item[data-page="dashboard"]'));
}

// =============================================
//  PAGE NAVIGATION
// =============================================
function showPage(name, el) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');

    // Load page data
    if (name === 'dashboard') loadDashboard();
    if (name === 'users') renderUsers();
    if (name === 'projects') renderProjects();
    if (name === 'tasks') {
        populateProjectFilter();
        document.getElementById('tasks-list').innerHTML = '<p style="color:var(--text-muted);padding:20px 0">Select a project above to see its tasks.</p>';
    }
    if (name === 'today') loadTodayPage();

    return false;
}

// =============================================
//  DATA LOADERS
// =============================================
async function loadUsersData() {
    try {
        const data = await apiFetch('/api/v1/users?page=0&size=100');
        allUsers = data.content || data || [];
    } catch { allUsers = []; }
}

async function loadProjectsData() {
    try {
        const data = await apiFetch('/api/v1/projects?page=0&size=100');
        allProjects = data.content || data || [];
    } catch { allProjects = []; }
}

// =============================================
//  DASHBOARD
// =============================================
async function loadDashboard() {
    await Promise.all([loadUsersData(), loadProjectsData()]);

    document.getElementById('stat-users').textContent = allUsers.length;
    document.getElementById('stat-projects').textContent = allProjects.length;

    // Due today
    try {
        const tasks = await apiFetch('/api/v1/tasks/due-today');
        document.getElementById('stat-today').textContent = tasks.length;
        renderMiniTasks(tasks, 'dashboard-today-tasks');
    } catch {
        document.getElementById('stat-today').textContent = '0';
    }
}

function renderMiniTasks(tasks, containerId) {
    const el = document.getElementById(containerId);
    if (!tasks || tasks.length === 0) {
        el.innerHTML = emptyState('No tasks due today!');
        return;
    }
    el.innerHTML = tasks.map(t => `
    <div class="task-mini-item">
      <div>
        <div class="task-mini-title">${esc(t.title)}</div>
        <div class="task-mini-meta">${esc(t.projectName || '')} · ${esc(t.assigneeUsername || 'Unassigned')}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="badge badge-${(t.priority||'').toLowerCase()}">${fmtPriority(t.priority)}</span>
        <span class="badge badge-${(t.status||'').toLowerCase()}">${fmtStatus(t.status)}</span>
      </div>
    </div>
  `).join('');
}

// =============================================
//  USERS
// =============================================
function renderUsers() {
    const el = document.getElementById('users-list');
    if (!allUsers.length) { el.innerHTML = emptyState('No users yet. Create one!'); return; }
    el.innerHTML = allUsers.map(u => `
    <div class="user-card">
      <div class="user-card-name">${esc(u.username)}</div>
      <div class="user-card-email">${esc(u.email)}</div>
      <div class="user-card-date">Joined ${fmtDate(u.createdAt)}</div>
    </div>
  `).join('');
}

async function createUser() {
    const username = document.getElementById('new-username').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value.trim();

    if (!username || !email || !password) { toast('Please fill all required fields.', 'error'); return; }
    if (username.length < 3) { toast('Username must be at least 3 characters.', 'error'); return; }
    if (password.length < 8) { toast('Password must be at least 8 characters.', 'error'); return; }

    try {
        await apiFetch('/api/v1/users', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        closeModal('modal-user');
        clearForm(['new-username', 'new-email', 'new-password']);
        await loadUsersData();
        renderUsers();
        toast('User created successfully!', 'success');
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}

// =============================================
//  PROJECTS
// =============================================
function renderProjects() {
    const el = document.getElementById('projects-list');
    if (!allProjects.length) { el.innerHTML = emptyState('No projects yet. Create one!'); return; }
    el.innerHTML = allProjects.map(p => `
    <div class="project-card">
      <div class="project-card-title">${esc(p.name)}</div>
      <div class="project-card-desc">${esc(p.description || 'No description.')}</div>
      <div class="project-card-meta">
        <span class="project-card-owner">Owner: ${esc(p.ownerUsername || p.ownerId || '—')}</span>
        <button class="load-tasks-btn" onclick="goToProjectTasks(${p.id})">View Tasks →</button>
      </div>
    </div>
  `).join('');
}

async function createProject() {
    const name = document.getElementById('new-proj-name').value.trim();
    const description = document.getElementById('new-proj-desc').value.trim();
    const ownerId = document.getElementById('new-proj-owner').value;

    if (!name || !ownerId) { toast('Project name and owner are required.', 'error'); return; }
    if (name.length < 3) { toast('Name must be at least 3 characters.', 'error'); return; }

    try {
        await apiFetch('/api/v1/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description, ownerId: parseInt(ownerId) })
        });
        closeModal('modal-project');
        clearForm(['new-proj-name', 'new-proj-desc']);
        document.getElementById('new-proj-owner').value = '';
        await loadProjectsData();
        renderProjects();
        toast('Project created!', 'success');
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}

function goToProjectTasks(projectId) {
    showPage('tasks', document.querySelector('.nav-item[data-page="tasks"]'));
    setTimeout(() => {
        document.getElementById('filter-project').value = projectId;
        loadTasks();
    }, 50);
}

// =============================================
//  TASKS
// =============================================
function populateProjectFilter() {
    const sel = document.getElementById('filter-project');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select a project...</option>' +
        allProjects.map(p => `<option value="${p.id}" ${p.id == cur ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
}

async function loadTasks() {
    const projectId = document.getElementById('filter-project').value;
    const status = document.getElementById('filter-status').value;
    const el = document.getElementById('tasks-list');

    if (!projectId) {
        el.innerHTML = '<p style="color:var(--text-muted);padding:20px 0">Select a project above to see its tasks.</p>';
        return;
    }

    try {
        let url = `/api/v1/projects/${projectId}/tasks?page=0&size=100`;
        if (status) url += `&status=${status}`;
        const data = await apiFetch(url);
        const tasks = data.content || data || [];
        renderTasksTable(tasks, el);
    } catch (e) {
        el.innerHTML = `<p style="color:var(--red)">Error loading tasks: ${e.message}</p>`;
    }
}

function renderTasksTable(tasks, el) {
    if (!tasks.length) {
        el.innerHTML = emptyState('No tasks found.');
        return;
    }
    el.innerHTML = `
    <table class="task-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${tasks.map(t => `
          <tr>
            <td>
              <div class="task-title-cell">${esc(t.title)}</div>
              ${t.description ? `<div class="task-desc-cell">${esc(t.description)}</div>` : ''}
            </td>
            <td><span class="badge badge-${(t.status||'').toLowerCase()}">${fmtStatus(t.status)}</span></td>
            <td><span class="badge badge-${(t.priority||'').toLowerCase()}">${fmtPriority(t.priority)}</span></td>
            <td>${esc(t.assigneeUsername || '—')}</td>
            <td>${t.dueDate ? fmtDate(t.dueDate) : '—'}</td>
            <td>
              <div class="task-actions">
                <button class="btn-icon" title="Edit" onclick='openEditTask(${JSON.stringify(t)})'>✏️</button>
                <button class="btn-icon" title="Activity Log" onclick="openActivities(${t.id})">📋</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function createTask() {
    const projectId = document.getElementById('new-task-project').value;
    const title = document.getElementById('new-task-title').value.trim();
    const description = document.getElementById('new-task-desc').value.trim();
    const status = document.getElementById('new-task-status').value;
    const priority = document.getElementById('new-task-priority').value;
    const dueDate = document.getElementById('new-task-due').value;
    const assigneeId = document.getElementById('new-task-assignee').value;

    if (!projectId || !title || !status || !priority || !assigneeId) {
        toast('Please fill all required fields.', 'error');
        return;
    }
    if (title.length < 3) { toast('Title must be at least 3 characters.', 'error'); return; }

    try {
        await apiFetch(`/api/v1/projects/${projectId}/tasks`, {
            method: 'POST',
            body: JSON.stringify({ title, description, status, priority, dueDate: dueDate || null, assigneeId: parseInt(assigneeId) })
        });
        closeModal('modal-task');
        toast('Task created! Email notification sent to assignee.', 'success');
        // Reload tasks if current project matches
        if (document.getElementById('filter-project').value == projectId) {
            loadTasks();
        }
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}

function openEditTask(task) {
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-desc').value = task.description || '';
    document.getElementById('edit-task-status').value = task.status;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due').value = task.dueDate || '';

    // Populate assignee select
    const sel = document.getElementById('edit-task-assignee');
    sel.innerHTML = '<option value="">Select a user...</option>' +
        allUsers.map(u => `<option value="${u.id}" ${u.id === task.assigneeId ? 'selected' : ''}>${esc(u.username)}</option>`).join('');

    openModal('modal-edit-task');
}

async function updateTask() {
    const id = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-desc').value.trim();
    const status = document.getElementById('edit-task-status').value;
    const priority = document.getElementById('edit-task-priority').value;
    const dueDate = document.getElementById('edit-task-due').value;
    const assigneeId = document.getElementById('edit-task-assignee').value;

    if (!title || !assigneeId) { toast('Title and assignee are required.', 'error'); return; }

    try {
        await apiFetch(`/api/v1/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description, status, priority, dueDate: dueDate || null, assigneeId: parseInt(assigneeId) })
        });
        closeModal('modal-edit-task');
        toast('Task updated!', 'success');
        loadTasks();
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}

async function deleteTaskFromEdit() {
    const id = document.getElementById('edit-task-id').value;
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
        await apiFetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
        closeModal('modal-edit-task');
        toast('Task deleted.', 'success');
        loadTasks();
    } catch (e) {
        toast('Error: ' + e.message, 'error');
    }
}

// =============================================
//  ACTIVITY LOG
// =============================================
async function openActivities(taskId) {
    const el = document.getElementById('activities-list');
    el.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
    openModal('modal-activities');
    try {
        const activities = await apiFetch(`/api/v1/tasks/${taskId}/activities`);
        if (!activities || activities.length === 0) {
            el.innerHTML = '<p style="color:var(--text-muted)">No activity yet.</p>';
            return;
        }
        el.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div>
          <div class="activity-action">${esc(a.action)}</div>
          <div class="activity-desc">${esc(a.description || '')}</div>
          <div class="activity-time">${fmtDate(a.createdAt)}</div>
        </div>
      </div>
    `).join('');
    } catch (e) {
        el.innerHTML = `<p style="color:var(--red)">Could not load activities.</p>`;
    }
}

// =============================================
//  DUE TODAY PAGE
// =============================================
async function loadTodayPage() {
    document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const el = document.getElementById('today-tasks-list');
    el.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
    try {
        const tasks = await apiFetch('/api/v1/tasks/due-today');
        renderTasksTable(tasks, el);
    } catch (e) {
        el.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    }
}

// =============================================
//  MODALS
// =============================================
function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('active');

    // Populate selects when opening
    if (id === 'modal-project') populateUserSelects('new-proj-owner');
    if (id === 'modal-task') {
        populateProjectSelectInModal('new-task-project');
        populateUserSelects('new-task-assignee');
        // Set today as default due date
        document.getElementById('new-task-due').value = new Date().toISOString().split('T')[0];
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
    modal.classList.remove('active');
}

function closeOnBackdrop(e, id) {
    if (e.target === e.currentTarget) closeModal(id);
}

function populateUserSelects(selectId) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">Select a user...</option>' +
        allUsers.map(u => `<option value="${u.id}">${esc(u.username)} (${esc(u.email)})</option>`).join('');
}

function populateProjectSelectInModal(selectId) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">Select a project...</option>' +
        allProjects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
}

// =============================================
//  TOAST
// =============================================
let toastTimer;
function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast' + (type ? ' ' + type : '');
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// =============================================
//  HELPERS
// =============================================
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtStatus(s) {
    const map = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
    return map[s] || s;
}

function fmtPriority(p) {
    const map = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
    return map[p] || p;
}

function emptyState(msg) {
    return `<div class="empty-state">
    <svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
    <p>${msg}</p>
  </div>`;
}

function clearForm(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}