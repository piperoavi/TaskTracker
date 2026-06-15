-- ==============================================
--  AUTO SEED DATA — runs on every H2 startup
--  Flyway handles schema; this fills sample data
-- ==============================================

-- USERS (password = 'password123' for all)
INSERT INTO users (username, email, password, created_at) VALUES
                                                              ('alice', 'alice@example.com', 'password123', CURRENT_TIMESTAMP),
                                                              ('bob', 'bob@example.com', 'password123', CURRENT_TIMESTAMP),
                                                              ('carol', 'carol@example.com', 'password123', CURRENT_TIMESTAMP);

-- PROJECTS
INSERT INTO projects (name, description, created_at, owner_id) VALUES
                                                                   ('Website Redesign', 'Redesign the company website with a modern look and feel', CURRENT_TIMESTAMP, 1),
                                                                   ('Mobile App', 'Build iOS and Android apps for customers', CURRENT_TIMESTAMP, 2),
                                                                   ('Backend API', 'REST API for all internal services', CURRENT_TIMESTAMP, 1);

-- TASKS
INSERT INTO tasks (title, description, status, priority, due_date, created_at, project_id, assignee_id) VALUES
                                                                                                            ('Design homepage mockup', 'Create wireframes and high-fidelity mockups', 'TODO', 'HIGH', CURRENT_DATE, CURRENT_TIMESTAMP, 1, 1),
                                                                                                            ('Implement login page', 'Build login form with validation', 'IN_PROGRESS', 'HIGH', CURRENT_DATE, CURRENT_TIMESTAMP, 1, 2),
                                                                                                            ('Write unit tests', 'Cover service layer with JUnit tests', 'TODO', 'MEDIUM', DATEADD(DAY, 2, CURRENT_DATE), CURRENT_TIMESTAMP, 3, 3),
                                                                                                            ('Set up CI/CD pipeline', 'Configure GitHub Actions for deployment', 'TODO', 'LOW', DATEADD(DAY, 5, CURRENT_DATE), CURRENT_TIMESTAMP, 3, 1),
                                                                                                            ('Build user registration API', 'POST /api/users endpoint with validation', 'COMPLETED', 'HIGH', DATEADD(DAY, -1, CURRENT_DATE), CURRENT_TIMESTAMP, 3, 2),
                                                                                                            ('Design app navigation', 'Tab bar and side drawer design', 'IN_PROGRESS', 'MEDIUM', DATEADD(DAY, 3, CURRENT_DATE), CURRENT_TIMESTAMP, 2, 3),
                                                                                                            ('Push notifications', 'Integrate FCM for push notifications', 'TODO', 'LOW', DATEADD(DAY, 7, CURRENT_DATE), CURRENT_TIMESTAMP, 2, 1);

-- TASK ACTIVITIES
INSERT INTO task_activities (action, description, created_at, task_id) VALUES
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 1),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 2),
                                                                           ('TASK_UPDATED', 'Status changed to IN_PROGRESS', CURRENT_TIMESTAMP, 2),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 3),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 4),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 5),
                                                                           ('TASK_UPDATED', 'Status changed to COMPLETED', CURRENT_TIMESTAMP, 5),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 6),
                                                                           ('TASK_CREATED', 'Task was created', CURRENT_TIMESTAMP, 7);