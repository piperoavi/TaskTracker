# Task Tracker Application

A RESTful Task Tracking Application built with Spring Boot 3, Spring Data JPA, Spring Security, Flyway, H2 Database, and Swagger/OpenAPI.

This project was developed as part of a Java/Spring Boot exercise focused on:

* CRUD operations
* REST API development
* Database integration
* Data validation
* Layered architecture
* Testing
* API documentation
* Additional advanced features

---

# Features

## User Management

* Create users
* Get user by ID
* Get all users with pagination
* Update users
* Delete users

## Project Management

* Create projects
* Assign project owner
* Get project by ID
* Get all projects with pagination
* Update projects
* Delete projects

## Task Management

* Create tasks inside projects
* Assign tasks to users
* Update task information
* Change task status
* Delete tasks
* Filter tasks by status
* Pagination support
* Retrieve tasks due today
* Retrieve tasks assigned to a specific user

## Task Activity Logging

Every important task operation is automatically logged:

* TASK_CREATED
* TASK_UPDATED
* TASK_DELETED
* STATUS_CHANGED

Activity history can be retrieved through dedicated endpoints.

---

# Technology Stack

## Backend

* Java 17
* Spring Boot 3.5
* Spring Web
* Spring Data JPA
* Spring Validation
* Spring Security
* Flyway Migration

## Database

* H2 In-Memory Database

## Documentation

* Swagger / OpenAPI

## Testing

* JUnit 5
* Mockito
* Spring Boot Test
* DataJpaTest

## Build Tool

* Maven

---

# Architecture

The application follows a layered architecture:

Controller Layer
↓
Service Layer
↓
Repository Layer
↓
Database

### Controllers

Responsible for:

* Request handling
* Response generation
* HTTP status management

### Services

Responsible for:

* Business logic
* Validation
* Entity processing
* Activity logging

### Repositories

Responsible for:

* Database communication
* CRUD operations
* Custom queries

---

# Project Structure

```text
src
├── main
│   ├── java
│   │   └── com.example.tasktracker
│   │       ├── controller
│   │       ├── service
│   │       ├── repository
│   │       ├── entity
│   │       ├── dto
│   │       ├── exception
│   │       ├── config
│   │       └── TaskTrackerApplication
│   │
│   └── resources
│       ├── application.properties
│       └── db
│           └── migration
│
└── test
    └── java
```

---

# Data Model

## User

| Field     | Type          |
| --------- | ------------- |
| id        | Long          |
| username  | String        |
| email     | String        |
| password  | String        |
| createdAt | LocalDateTime |

### Validation

* username required
* minimum 3 characters
* email valid format
* password minimum 8 characters

---

## Project

| Field       | Type          |
| ----------- | ------------- |
| id          | Long          |
| name        | String        |
| description | String        |
| createdAt   | LocalDateTime |

### Relationships

* Many Projects → One User (Owner)
* One Project → Many Tasks

---

## Task

| Field       | Type          |
| ----------- | ------------- |
| id          | Long          |
| title       | String        |
| description | String        |
| status      | TaskStatus    |
| priority    | TaskPriority  |
| dueDate     | LocalDate     |
| createdAt   | LocalDateTime |

### Status Enum

```java
TODO
IN_PROGRESS
COMPLETED
```

### Priority Enum

```java
LOW
MEDIUM
HIGH
```

### Relationships

* Many Tasks → One Project
* Many Tasks → One User (Assignee)

---

## TaskActivity

| Field       | Type          |
| ----------- | ------------- |
| id          | Long          |
| action      | String        |
| description | String        |
| createdAt   | LocalDateTime |
| task        | Task          |

Used for audit trail and activity history.

---

# API Endpoints

## User Endpoints

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/v1/users      |
| GET    | /api/v1/users      |
| GET    | /api/v1/users/{id} |
| PUT    | /api/v1/users/{id} |
| DELETE | /api/v1/users/{id} |

---

## Project Endpoints

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /api/v1/projects      |
| GET    | /api/v1/projects      |
| GET    | /api/v1/projects/{id} |
| PUT    | /api/v1/projects/{id} |
| DELETE | /api/v1/projects/{id} |

---

## Task Endpoints

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| POST   | /api/v1/projects/{projectId}/tasks |
| GET    | /api/v1/tasks/{id}                 |
| PUT    | /api/v1/tasks/{id}                 |
| DELETE | /api/v1/tasks/{id}                 |
| GET    | /api/v1/projects/{projectId}/tasks |
| GET    | /api/v1/tasks/due-today            |
| GET    | /api/v1/tasks/{id}/activities      |

---

# Pagination Example

```http
GET /api/v1/projects?page=0&size=5
```

```http
GET /api/v1/projects/1/tasks?page=0&size=10
```

---

# Filtering Example

```http
GET /api/v1/projects/1/tasks?status=TODO
```

```http
GET /api/v1/projects/1/tasks?status=IN_PROGRESS
```

```http
GET /api/v1/projects/1/tasks?status=COMPLETED
```

---

# Database Migration

Flyway is used for database versioning.

Migration files are located in:

```text
src/main/resources/db/migration
```

Example:

```text
V1__create_tables.sql
```

Flyway automatically executes migrations on application startup.

---

# Validation

Spring Validation is used through:

```java
@Valid
@NotBlank
@Email
@Size
```

Validation errors are handled globally using:

```java
@ControllerAdvice
```

---

# Security

Spring Security Basic Authentication is configured.

Protected endpoints require authentication.

Example credentials can be configured in:

```properties
spring.security.user.name=admin
spring.security.user.password=admin
```

---

# Swagger Documentation

After starting the application:

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI Docs:

```text
http://localhost:8080/v3/api-docs
```

---

# Testing

The project includes:

## Controller Integration Tests

* UserControllerTest
* ProjectControllerTest
* TaskControllerTest

## Service Unit Tests

* UserServiceTest
* ProjectServiceTest
* TaskServiceTest

Using:

* JUnit 5
* Mockito

## Repository Tests

Using:

```java
@DataJpaTest
```

to verify repository behavior and custom queries.

---

# Running the Application

## Clone Repository

```bash
git clone https://github.com/piperoavi/TaskTracker.git
```

```bash
cd TaskTracker
```

## Build Project

```bash
mvn clean install
```

## Run Application

```bash
mvn spring-boot:run
```

Application starts at:

```text
http://localhost:8080
```

---

# H2 Database Console

```text
http://localhost:8080/h2-console
```

Example JDBC URL:

```text
jdbc:h2:mem:tasktrackerdb
```

---

# Assumptions

* Each project has one owner.
* Tasks belong to exactly one project.
* Tasks may optionally be assigned to a user.
* Activity logs are automatically generated for task operations.
* DTOs are used to prevent exposing internal entity relationships.
* H2 database is used for development and testing.

---

# Future Improvements

* JWT Authentication
* Email Notifications
* File Attachments
* Task Comments
* Search with Specifications
* Role-Based Authorization
* PostgreSQL/MySQL Support
* Docker Deployment

---

# Author

Iva Pipero

Java • Spring Boot • JPA • REST APIs • H2 • Flyway • Swagger • Testing
