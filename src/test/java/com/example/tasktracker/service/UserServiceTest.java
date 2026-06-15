package com.example.tasktracker.service;

import com.example.tasktracker.dto.UserRequest;
import com.example.tasktracker.dto.UserResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_shouldReturnUserResponseWithoutPassword() {
        UserRequest request = new UserRequest();
        request.setUsername("ergis");
        request.setEmail("ergis@test.com");
        request.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("ergis");
        savedUser.setEmail("ergis@test.com");
        savedUser.setPassword("password123");
        savedUser.setCreatedAt(LocalDateTime.now());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.createUser(request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.username()).isEqualTo("ergis");
        assertThat(response.email()).isEqualTo("ergis@test.com");

        verify(userRepository).save(any(User.class));
    }

    @Test
    void getUserById_shouldReturnUserResponse() {
        User user = new User();
        user.setId(1L);
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.username()).isEqualTo("ergis");
        assertThat(response.email()).isEqualTo("ergis@test.com");

        verify(userRepository).findById(1L);
    }

    @Test
    void deleteUser_shouldDeleteExistingUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.deleteUser(1L);

        verify(userRepository).findById(1L);
        verify(userRepository).delete(user);
    }
}