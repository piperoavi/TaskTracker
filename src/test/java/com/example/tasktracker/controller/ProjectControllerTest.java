package com.example.tasktracker.controller;

import com.example.tasktracker.dto.ProjectRequest;
import com.example.tasktracker.entity.Project;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.ProjectRepository;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void cleanDatabase() {
        projectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin")
    void createProject_shouldReturnProjectResponse() throws Exception {
        User owner = createTestUser("ergis", "ergis@test.com");

        ProjectRequest request = new ProjectRequest();
        request.setName("Spring Boot Project");
        request.setDescription("Testing project controller");
        request.setOwnerId(owner.getId());

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Spring Boot Project")))
                .andExpect(jsonPath("$.description", is("Testing project controller")))
                .andExpect(jsonPath("$.ownerId", is(owner.getId().intValue())))
                .andExpect(jsonPath("$.ownerUsername", is("ergis")));
    }

    @Test
    @WithMockUser(username = "admin")
    void getProjectById_shouldReturnProjectResponse() throws Exception {
        User owner = createTestUser("ergis", "ergis@test.com");

        Project project = new Project();
        project.setName("Backend Project");
        project.setDescription("Project for testing");
        project.setCreatedAt(LocalDateTime.now());
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);

        mockMvc.perform(get("/api/v1/projects/" + savedProject.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Backend Project")))
                .andExpect(jsonPath("$.description", is("Project for testing")))
                .andExpect(jsonPath("$.ownerId", is(owner.getId().intValue())))
                .andExpect(jsonPath("$.ownerUsername", is("ergis")));
    }

    private User createTestUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}