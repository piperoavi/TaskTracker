package com.example.tasktracker.controller;

import com.example.tasktracker.dto.UserRequest;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    @WithMockUser(username = "admin")
    void createUser_shouldReturnCreatedUserWithoutPassword() throws Exception {
        UserRequest request = new UserRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("testuser")))
                .andExpect(jsonPath("$.email", is("testuser@test.com")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @WithMockUser(username = "admin")
    void getUserById_shouldReturnUserWithoutPassword() throws Exception {
        User user = new User();
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        mockMvc.perform(get("/api/v1/users/" + savedUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("ergis")))
                .andExpect(jsonPath("$.email", is("ergis@test.com")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}