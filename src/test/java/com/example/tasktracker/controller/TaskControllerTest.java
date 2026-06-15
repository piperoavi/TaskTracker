package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.entity.*;
import com.example.tasktracker.repository.ProjectRepository;
import com.example.tasktracker.repository.TaskActivityRepository;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskActivityRepository taskActivityRepository;

    @BeforeEach
    void cleanDatabase() {
        taskActivityRepository.deleteAll();
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin")
    void createTask_shouldReturnTaskResponse() throws Exception {
        User user = createTestUser();
        Project project = createTestProject(user);

        TaskRequest request = new TaskRequest();
        request.setTitle("Create task API");
        request.setDescription("Implement task creation endpoint");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.HIGH);
        request.setDueDate(LocalDate.now());
        request.setAssigneeId(user.getId());

        mockMvc.perform(post("/api/v1/projects/" + project.getId() + "/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Create task API")))
                .andExpect(jsonPath("$.status", is("TODO")))
                .andExpect(jsonPath("$.priority", is("HIGH")))
                .andExpect(jsonPath("$.projectId", is(project.getId().intValue())))
                .andExpect(jsonPath("$.projectName", is("Spring Boot Project")))
                .andExpect(jsonPath("$.assigneeId", is(user.getId().intValue())))
                .andExpect(jsonPath("$.assigneeUsername", is("ergis")))
                .andExpect(jsonPath("$.project").doesNotExist())
                .andExpect(jsonPath("$.assignee").doesNotExist());
    }

    @Test
    @WithMockUser(username = "admin")
    void getTaskById_shouldReturnTaskResponse() throws Exception {
        User user = createTestUser();
        Project project = createTestProject(user);
        Task task = createTestTask(project, user);

        mockMvc.perform(get("/api/v1/tasks/" + task.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Test Task")))
                .andExpect(jsonPath("$.projectName", is("Spring Boot Project")))
                .andExpect(jsonPath("$.assigneeUsername", is("ergis")))
                .andExpect(jsonPath("$.project").doesNotExist())
                .andExpect(jsonPath("$.assignee").doesNotExist());
    }

    private User createTestUser() {
        User user = new User();
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    private Project createTestProject(User owner) {
        Project project = new Project();
        project.setName("Spring Boot Project");
        project.setDescription("Project for task controller test");
        project.setCreatedAt(LocalDateTime.now());
        project.setOwner(owner);

        return projectRepository.save(project);
    }

    private Task createTestTask(Project project, User assignee) {
        Task task = new Task();
        task.setTitle("Test Task");
        task.setDescription("Task controller test");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.HIGH);
        task.setDueDate(LocalDate.now());
        task.setCreatedAt(LocalDateTime.now());
        task.setProject(project);
        task.setAssignee(assignee);

        return taskRepository.save(task);
    }
}