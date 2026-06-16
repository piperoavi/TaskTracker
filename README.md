# TaskTracker

A full-stack task tracking application built with **Spring Boot 3.5** and vanilla **HTML/CSS/JavaScript**. Users can register, create projects, assign tasks to teammates, track progress, and receive email notifications.

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Email Configuration](#email-configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Permission Model](#permission-model)
- [Frontend Features](#frontend-features)
- [Assumptions Made](#assumptions-made)

---

## Technologies Used

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.5.0 |
| REST API | Spring Web (MVC) |
| Database | H2 In-Memory |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Validation | Spring Validation (Jakarta) |
| Security | Spring Security (HTTP Basic) |
| Email | Spring Mail (Jakarta Mail / Gmail SMTP) |
| Documentation | Swagger / SpringDoc OpenAPI |
| Testing | JUnit 5, Mockito, MockMvc, @DataJpaTest |
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Build | Maven |

---

## Setup Instructions

### Prerequisites

- Java 17+
- Maven 3.8+
- A Gmail account with an App Password (for email notifications)

### 1. Clone the repository

```bash
git clone https://github.com/piperoavi/TaskTracker.git
cd TaskTracker
```

### 2. Configure email (optional)

Open `src/main/resources/application.yml` and fill in:

```yaml
spring:
  mail:
    username: your-gmail@gmail.com
    password: "your-16-char-app-password"
```

See [Email Configuration](#email-configuration) for how to get a Gmail App Password.

Email is non-critical — if not configured, the app runs fine and tasks are created normally.

### 3. Run the application

```bash
mvn spring-boot:run
```

Or run `TaskTrackerApplication.java` directly from IntelliJ IDEA.

### 4. Open the app

```
http://localhost:8080/index.html
```

### 5. Other useful URLs

| URL | Description |
|---|---|
| `http://localhost:8080/index.html` | Main frontend |
| `http://localhost:8080/swagger-ui/index.html` | Swagger API docs |
| `http://localhost:8080/h2-console` | H2 database console |
| `http://localhost:8080/v3/api-docs` | Raw OpenAPI JSON |

**H2 Console settings:**
- JDBC URL: `jdbc:h2:mem:tasktrackerdb`
- Username: `sa`
- Password: *(leave empty)*

**Spring Security (API gate):**
- Username: `admin`
- Password: `admin123`

---

## Email Configuration

The app uses Gmail SMTP on port 465 with SSL.

### Steps to get a Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (must be enabled)
3. Scroll down → **App Passwords**
4. Generate one for **Mail**
5. Copy the 16-character password

### application.yml mail section

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 465
    username: your-gmail@gmail.com
    password: "abcd efgh ijkl mnop"   # keep quotes, include spaces
    properties:
      mail:
        smtp:
          auth: true
          ssl:
            enable: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
        starttls:
          enable: false               # must be false when using port 465
```

**Important:** `starttls.enable` must be `false` when using port 465 SSL. Setting both to `true` causes a connection failure.

---

## Database Schema

The app uses H2 in-memory database. Flyway manages schema creation. Data is seeded automatically via `data.sql` on every startup.

```
┌─────────────┐         ┌──────────────┐         ┌────────────────────┐
│    users    │         │   projects   │         │       tasks        │
├─────────────┤         ├──────────────┤         ├────────────────────┤
│ id (PK)     │◄──┐     │ id (PK)      │◄──┐     │ id (PK)            │
│ username    │   │     │ name         │   │     │ title              │
│ email       │   │     │ description  │   │     │ description        │
│ password    │   │     │ created_at   │   │     │ status (enum)      │
│ created_at  │   └─────│ owner_id(FK) │   └─────│ project_id (FK)    │
└─────────────┘         └──────────────┘         │ priority (enum)    │
                                                  │ due_date           │
      ┌───────────────────────────────────────────│ assignee_id (FK)   │
      │                                           │ created_at         │
      ▼                                           └────────────────────┘
┌─────────────┐                                           │
│    users    │                                           │
│ (assignee)  │              ┌────────────────────┐       │
└─────────────┘              │   task_activities  │       │
                             ├────────────────────┤       │
                             │ id (PK)            │       │
                             │ action             │       │
                             │ description        │       │
                             │ created_at         │       │
                             │ task_id (FK)       │◄──────┘
                             └────────────────────┘

Enums:
  TaskStatus:   TODO | IN_PROGRESS | COMPLETED
  TaskPriority: LOW  | MEDIUM      | HIGH
```

### Seed Data (auto-inserted on every startup)

| Entity | Records |
|---|---|
| Users | alice, bob, carol |
| Projects | Website Redesign, Mobile App, Backend API |
| Tasks | 7 tasks across all projects (2 due today) |
| Activities | 9 pre-seeded audit log entries |

---

## API Documentation

Full interactive docs available at: `http://localhost:8080/swagger-ui/index.html`

### Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/users` | Create a new user |
| GET | `/api/v1/users` | Get all users (paginated) |
| GET | `/api/v1/users/{id}` | Get user by ID |
| PUT | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Delete user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/projects` | Create a new project |
| GET | `/api/v1/projects` | Get all projects (paginated) |
| GET | `/api/v1/projects/{id}` | Get project by ID |
| PUT | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project and all its tasks |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/projects/{projectId}/tasks` | Create a task (owner only) |
| GET | `/api/v1/tasks/{id}` | Get task by ID |
| GET | `/api/v1/projects/{projectId}/tasks` | Get all tasks in project (filter by `?status=`) |
| PUT | `/api/v1/tasks/{id}` | Update task (owner: all fields; assignee: status only) |
| DELETE | `/api/v1/tasks/{id}?requesterId={userId}` | Delete task (owner only) |
| GET | `/api/v1/tasks/due-today` | Get all tasks due today |
| GET | `/api/v1/users/{userId}/tasks` | Get all tasks assigned to a user |
| GET | `/api/v1/tasks/{taskId}/activities` | Get activity log for a task |

### Example Request Bodies

**Create User**
```json
{
  "username": "iva",
  "email": "iva@example.com",
  "password": "password123"
}
```

**Create Project**
```json
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "ownerId": 1
}
```

**Create Task**
```json
{
  "title": "Build login page",
  "description": "Implement login form with validation",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-07-01",
  "assigneeId": 2,
  "requesterId": 1
}
```

**Update Task (owner)**
```json
{
  "title": "Build login page",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-07-05",
  "assigneeId": 2,
  "requesterId": 1
}
```

**Update Task (assignee — only status matters)**
```json
{
  "title": "Build login page",
  "description": "Build login form with validation",
  "status": "COMPLETED",
  "priority": "HIGH",
  "dueDate": "2026-07-01",
  "assigneeId": 2,
  "requesterId": 2
}
```

---

## Permission Model

| Action | Project Owner | Task Assignee | Other Users |
|---|---|---|---|
| Create project | ✅ | ✅ | ✅ |
| Delete own project | ✅ | ❌ | ❌ |
| Create task in project | ✅ (own projects only) | ❌ | ❌ |
| Edit task (all fields) | ✅ | ❌ | ❌ |
| Edit task (status only) | ✅ | ✅ | ❌ |
| Delete task | ✅ | ❌ | ❌ |
| View all tasks | ✅ | ✅ | ✅ |
| View own assigned tasks | ✅ | ✅ | ✅ |

### Rules enforced on both frontend and backend

- Due dates cannot be set in the past (validated in `TaskService` and blocked in the browser date picker)
- Only project owners see the **+ New Task** button on their projects
- Non-owners see a 🔒 lock icon instead of the edit button on tasks they are not assigned to
- The Delete button in the edit modal is hidden for non-owners
- All permission checks are enforced server-side regardless of what the frontend sends

---

## Frontend Features

The frontend is a single-page application (SPA) built with plain HTML, CSS, and JavaScript.

### Pages

| Page | Description |
|---|---|
| **Dashboard** | Overview with KPI cards (open tasks, due today, projects), quick task lists |
| **My Tasks** | All tasks assigned to the logged-in user, filterable by status |
| **Projects** | All projects; owners see a delete button and "You own this" badge |
| **Browse Tasks** | Browse tasks by project with status filter; + New Task visible only to owners |
| **Due Today** | All tasks across the system due today |
| **People** | All registered users; your own card is highlighted |

### Auth flow

1. Open the app → **Register** with username, email, password
2. On next visit → **Sign In** with username
3. The app uses `admin/admin123` as a transparent Spring Security gate — users never see this
4. Sign Out clears the session

### Activity Log

Every task action is recorded:
- `TASK_CREATED` — "Task 'X' created and assigned to Y."
- `TASK_UPDATED` — detailed diff e.g. "Status changed from TODO to IN_PROGRESS. Priority changed from LOW to HIGH."
- `TASK_DELETED` — recorded before deletion

---

## Testing

```bash
mvn test
```

### Test coverage

| Layer | Test class | What it tests |
|---|---|---|
| Repository | `TaskRepositoryTest` | `findTasksDueToday()` JPQL query via `@DataJpaTest` |
| Service | `UserServiceTest` | User creation, retrieval, update, delete with Mockito mocks |
| Service | `ProjectServiceTest` | Project CRUD with mocked repositories |
| Service | `TaskServiceTest` | Task creation, update, delete, activity logging with mocks |
| Controller | `UserControllerTest` | HTTP endpoints via MockMvc + `@WithMockUser` |
| Controller | `ProjectControllerTest` | HTTP endpoints via MockMvc |
| Controller | `TaskControllerTest` | HTTP endpoints via MockMvc |

---

## Assumptions Made

1. **No JWT** — Spring Security Basic Auth is used as the API gate. The frontend handles user identity by matching the registered username against the database. This is appropriate for an internal/assignment context but would need JWT for production.

2. **Passwords are stored in plain text** — For this assignment, passwords are not hashed. A production app would use BCrypt via Spring Security's `PasswordEncoder`.

3. **H2 in-memory** — Data does not persist between restarts. This is intentional for development/demo purposes as specified in the assignment.

4. **Single project ownership** — A project has one owner. There is no concept of co-owners or roles within a project beyond owner/member.

5. **Task assignee = team member** — Any registered user can be assigned a task. There is no explicit "join project" step.

6. **Email is best-effort** — If SMTP is not configured or the network blocks the port, the app continues normally and logs a warning. Tasks are always created successfully regardless of email status.

7. **requesterId sent from frontend** — Since there is no JWT session, the logged-in user's ID is sent in the request body as `requesterId` for permission checks. This is validated server-side against the actual database record.