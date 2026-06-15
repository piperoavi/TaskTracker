const API = "http://localhost:8080/api/v1";

function authHeader() {
    const username = document.getElementById("authUsername").value;
    const password = document.getElementById("authPassword").value;

    return "Basic " + btoa(username + ":" + password);
}

function show(data) {
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader(),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function createUser() {
    try {
        const data = await request(`${API}/users`, {
            method: "POST",
            body: JSON.stringify({
                username: document.getElementById("username").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            })
        });

        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function loadUsers() {
    try {
        const data = await request(`${API}/users?page=0&size=10`);
        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function createProject() {
    try {
        const data = await request(`${API}/projects`, {
            method: "POST",
            body: JSON.stringify({
                name: document.getElementById("projectName").value,
                description: document.getElementById("projectDescription").value,
                ownerId: Number(document.getElementById("ownerId").value)
            })
        });

        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function loadProjects() {
    try {
        const data = await request(`${API}/projects?page=0&size=10`);
        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function createTask() {
    try {
        const projectId = document.getElementById("taskProjectId").value;

        const data = await request(`${API}/projects/${projectId}/tasks`, {
            method: "POST",
            body: JSON.stringify({
                title: document.getElementById("taskTitle").value,
                description: document.getElementById("taskDescription").value,
                status: document.getElementById("taskStatus").value,
                priority: document.getElementById("taskPriority").value,
                dueDate: document.getElementById("taskDueDate").value,
                assigneeId: Number(document.getElementById("assigneeId").value)
            })
        });

        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function loadTasksDueToday() {
    try {
        const data = await request(`${API}/tasks/due-today`);
        show(data);
    } catch (error) {
        show(error.message);
    }
}

async function loadProjectTasks() {
    try {
        const projectId = document.getElementById("filterProjectId").value;
        const status = document.getElementById("filterStatus").value;

        let url = `${API}/projects/${projectId}/tasks?page=0&size=10`;

        if (status) {
            url += `&status=${status}`;
        }

        const data = await request(url);
        show(data);
    } catch (error) {
        show(error.message);
    }
}