package com.example.tasktracker.service;

import com.example.tasktracker.dto.ProjectRequest;
import com.example.tasktracker.dto.ProjectResponse;
import com.example.tasktracker.entity.Project;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.ProjectRepository;
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
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void createProject_shouldReturnProjectResponse() {

        User owner = new User();
        owner.setId(1L);
        owner.setUsername("ergis");

        ProjectRequest request = new ProjectRequest();
        request.setName("Spring Boot Project");
        request.setDescription("Project Service Test");
        request.setOwnerId(1L);

        Project savedProject = new Project();
        savedProject.setId(1L);
        savedProject.setName(request.getName());
        savedProject.setDescription(request.getDescription());
        savedProject.setCreatedAt(LocalDateTime.now());
        savedProject.setOwner(owner);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(owner));

        when(projectRepository.save(any(Project.class)))
                .thenReturn(savedProject);

        ProjectResponse response =
                projectService.createProject(request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name())
                .isEqualTo("Spring Boot Project");
        assertThat(response.ownerUsername())
                .isEqualTo("ergis");

        verify(userRepository).findById(1L);
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void getProjectById_shouldReturnProjectResponse() {

        User owner = new User();
        owner.setId(1L);
        owner.setUsername("ergis");

        Project project = new Project();
        project.setId(1L);
        project.setName("Backend Project");
        project.setDescription("Testing");
        project.setCreatedAt(LocalDateTime.now());
        project.setOwner(owner);

        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(project));

        ProjectResponse response =
                projectService.getProjectById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name())
                .isEqualTo("Backend Project");
        assertThat(response.ownerUsername())
                .isEqualTo("ergis");

        verify(projectRepository).findById(1L);
    }

    @Test
    void deleteProject_shouldDeleteExistingProject() {

        User owner = new User();
        owner.setId(1L);
        owner.setUsername("ergis");

        Project project = new Project();
        project.setId(1L);
        project.setName("Backend Project");
        project.setOwner(owner);

        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(project));

        projectService.deleteProject(1L);

        verify(projectRepository).findById(1L);
        verify(projectRepository).delete(project);
    }
}