# Task Tracking Application

A Spring Boot REST API for managing users, projects, tasks, task activities, and task assignment notifications.

## Technologies Used

- Java 17
- Spring Boot 3.5.0
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security Basic Auth
- H2 In-Memory Database
- Flyway
- Swagger/OpenAPI
- Spring Mail
- Lombok
- JUnit 5
- Mockito
- MockMvc
- HTML, CSS, JavaScript

## Features

- User CRUD
- Project CRUD
- Task CRUD
- Task filtering by status
- Pagination
- Tasks due today
- Tasks assigned to user
- Task activity logging
- Email notification on task assignment
- DTO responses to hide passwords and nested objects
- Global exception handling
- Swagger API documentation
- Basic frontend using HTML/CSS/JavaScript
- Automated tests

## Authentication

The API uses Basic Authentication.

Username:

```text
admin

Password:

admin123
How to Run

Clone the repository:

git clone <repository-url>
cd task-tracker

Run the application:

mvn spring-boot:run

Application runs on:

http://localhost:8080

Frontend:

http://localhost:8080/index.html

Swagger UI:

http://localhost:8080/swagger-ui/index.html

H2 Console:

http://localhost:8080/h2-console
H2 Database

JDBC URL:

jdbc:h2:mem:tasktrackerdb

Username:

sa

Password is empty.

The database is in-memory, so data is deleted when the application restarts.

API Endpoints
Users
POST /api/v1/users
GET /api/v1/users
GET /api/v1/users/{id}
PUT /api/v1/users/{id}
DELETE /api/v1/users/{id}
Projects
POST /api/v1/projects
GET /api/v1/projects
GET /api/v1/projects/{id}
PUT /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
Tasks
POST /api/v1/projects/{projectId}/tasks
GET /api/v1/tasks/{id}
GET /api/v1/projects/{projectId}/tasks
GET /api/v1/projects/{projectId}/tasks?status=TODO
PUT /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}
GET /api/v1/tasks/due-today
GET /api/v1/users/{userId}/tasks
GET /api/v1/tasks/{taskId}/activities
Example Request Bodies
Create User
{
  "username": "ergis",
  "email": "ergis@test.com",
  "password": "password123"
}
Create Project
{
  "name": "Spring Boot Project",
  "description": "Task tracking backend",
  "ownerId": 1
}
Create Task
{
  "title": "Create task API",
  "description": "Implement task creation endpoint",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-06-15",
  "assigneeId": 1
}
Database Schema

Main entities:

User
- id
- username
- email
- password
- createdAt

Project
- id
- name
- description
- createdAt
- owner_id

Task
- id
- title
- description
- status
- priority
- dueDate
- createdAt
- project_id
- assignee_id

TaskActivity
- id
- action
- description
- createdAt
- task_id

Relationships:

User 1 --- many Project
User 1 --- many Task
Project 1 --- many Task
Task 1 --- many TaskActivity
Testing

Implemented tests:

Repository Tests:
- TaskRepositoryTest

Service Tests:
- UserServiceTest
- ProjectServiceTest
- TaskServiceTest

Controller Integration Tests:
- UserControllerTest
- ProjectControllerTest
- TaskControllerTest

Run tests:

mvn test
Optional Features Implemented

The assignment required at least two optional advanced features.

Implemented:

1. Task activity logging
2. Email notifications for task assignment
3. Basic authentication with Spring Security
Assumptions
H2 in-memory database is used for development and testing.
Passwords are hidden from API responses using DTOs.
Email notification logic is implemented, but real SMTP credentials must be configured for actual email sending.
Basic HTML/CSS/JavaScript frontend is enough for the assignment requirements.

Create a file named:

```text
README.md