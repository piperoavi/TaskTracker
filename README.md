Task Tracker Application

A RESTful Task Tracking Application built with Spring Boot 3, Spring Data JPA, Spring Security, Flyway, H2 Database, and Swagger/OpenAPI.

This project was developed as part of a Java/Spring Boot exercise focused on CRUD operations, REST API development, database integration, validation, testing, and software architecture principles.

Features
User Management
Create users
Retrieve users by ID
Retrieve all users with pagination
Update users
Delete users
Project Management
Create projects
Assign project owners
Retrieve projects by ID
Retrieve all projects with pagination
Update projects
Delete projects
Task Management
Create tasks within projects
Assign tasks to users
Update tasks and task status
Delete tasks
Filter tasks by status
Pagination support
Retrieve tasks due today
Retrieve tasks assigned to a specific user
Task Activity Logging

The application automatically tracks important task events:

TASK_CREATED
TASK_UPDATED
TASK_DELETED
STATUS_CHANGED

Activity logs can be retrieved through dedicated endpoints.

Technology Stack
Backend
Java 17
Spring Boot 3.5
Spring Web
Spring Data JPA
Spring Validation
Spring Security
Flyway
Database
H2 In-Memory Database
API Documentation
Swagger / OpenAPI
Testing
JUnit 5
Mockito
Spring Boot Test
DataJpaTest
Build Tool
Maven
Architecture

The application follows a layered architecture:

Controller Layer
↓
Service Layer
↓
Repository Layer
↓
Database

Controller Layer

Responsible for handling HTTP requests and returning responses.

Service Layer

Responsible for business logic, validation, DTO mapping, and activity logging.

Repository Layer

Responsible for database access and custom queries.

Data Model
User
Field	Type
id	Long
username	String
email	String
password	String
createdAt	LocalDateTime
Validation
Username required (minimum 3 characters)
Valid email required
Password required (minimum 8 characters)
Project
Field	Type
id	Long
name	String
description	String
createdAt	LocalDateTime
Relationships
Many Projects → One User (Owner)
One Project → Many Tasks
Task
Field	Type
id	Long
title	String
description	String
status	TaskStatus
priority	TaskPriority
dueDate	LocalDate
createdAt	LocalDateTime
Status Values
TODO
IN_PROGRESS
COMPLETED
Priority Values
LOW
MEDIUM
HIGH
Relationships
Many Tasks → One Project
Many Tasks → One User (Assignee)
TaskActivity
Field	Type
id	Long
action	String
description	String
createdAt	LocalDateTime
task	Task

Used to store audit history for task actions.

API Endpoints
User Endpoints
Method	Endpoint
POST	/api/v1/users
GET	/api/v1/users
GET	/api/v1/users/{id}
PUT	/api/v1/users/{id}
DELETE	/api/v1/users/{id}
Project Endpoints
Method	Endpoint
POST	/api/v1/projects
GET	/api/v1/projects
GET	/api/v1/projects/{id}
PUT	/api/v1/projects/{id}
DELETE	/api/v1/projects/{id}
Task Endpoints
Method	Endpoint
POST	/api/v1/projects/{projectId}/tasks
GET	/api/v1/tasks/{id}
PUT	/api/v1/tasks/{id}
DELETE	/api/v1/tasks/{id}
GET	/api/v1/projects/{projectId}/tasks
GET	/api/v1/tasks/due-today
GET	/api/v1/tasks/{id}/activities
Additional Features Implemented
Pagination

Implemented for:

Users
Projects
Tasks

Example:

GET /api/v1/projects?page=0&size=5

Task Filtering

Tasks can be filtered by status:

GET /api/v1/projects/{projectId}/tasks?status=TODO

Custom Repository Query

Implemented custom JPA query for retrieving tasks due today.

Global Exception Handling

Implemented using @ControllerAdvice.

DTO Mapping

DTOs are used to avoid exposing internal entity relationships and sensitive data.

Activity Logging

Every task action is automatically recorded in the TaskActivity table.

Database Migration

Flyway is used for database schema management.

Migration scripts are located in:

src/main/resources/db/migration

Example:

V1__create_tables.sql

Security

Spring Security Basic Authentication is configured to secure API endpoints.

Swagger Documentation

After running the application:

Swagger UI:

http://localhost:8080/swagger-ui.html

OpenAPI Docs:

http://localhost:8080/v3/api-docs

Testing

The project includes:

Integration Tests
UserControllerTest
ProjectControllerTest
TaskControllerTest
Unit Tests
UserServiceTest
ProjectServiceTest
TaskServiceTest
Repository Tests

Implemented using @DataJpaTest.

Running the Application
Clone Repository

git clone https://github.com/piperoavi/TaskTracker.git

Build Project

mvn clean install

Run Application

mvn spring-boot:run

Application runs on:

http://localhost:8080

H2 Console

http://localhost:8080/h2-console

JDBC URL:

jdbc:h2:mem:tasktrackerdb

Future Improvements
JWT Authentication
Role-Based Authorization
Email Notifications
File Attachments
Task Comments
Search using Specifications
PostgreSQL Support
Docker Deployment
Author

Ergis Pipero

Java • Spring Boot • REST APIs • JPA • H2 • Flyway • Swagger • Testing