package com.example.tasktracker.service;

import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.Project;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.TaskPriority;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.ProjectRepository;
import com.example.tasktracker.repository.TaskActivityRepository;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskActivityRepository taskActivityRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private TaskService taskService;

    @Test
    void createTask_shouldCreateTaskLogActivityAndSendEmail() {
        User user = new User();
        user.setId(1L);
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");

        Project project = new Project();
        project.setId(1L);
        project.setName("Spring Boot Project");
        project.setOwner(user);

        TaskRequest request = new TaskRequest();
        request.setTitle("Create tests");
        request.setDescription("Write service tests");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.HIGH);
        request.setDueDate(LocalDate.now());
        request.setAssigneeId(1L);

        Task savedTask = new Task();
        savedTask.setId(1L);
        savedTask.setTitle(request.getTitle());
        savedTask.setDescription(request.getDescription());
        savedTask.setStatus(request.getStatus());
        savedTask.setPriority(request.getPriority());
        savedTask.setDueDate(request.getDueDate());
        savedTask.setCreatedAt(LocalDateTime.now());
        savedTask.setProject(project);
        savedTask.setAssignee(user);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskResponse response = taskService.createTask(1L, request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Create tests");
        assertThat(response.projectName()).isEqualTo("Spring Boot Project");
        assertThat(response.assigneeUsername()).isEqualTo("ergis");

        verify(projectRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
        verify(taskActivityRepository).save(any());
        verify(emailService).sendTaskAssignedEmail(
                "ergis@test.com",
                "Create tests",
                request.getDueDate().toString()
        );
    }
}