package com.example.tasktracker.repository;

import com.example.tasktracker.entity.Project;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.TaskPriority;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void findTasksDueToday_shouldReturnOnlyTasksDueToday() {
        User user = new User();
        user.setUsername("ergis");
        user.setEmail("ergis@test.com");
        user.setPassword("password123");
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        Project project = new Project();
        project.setName("Test Project");
        project.setDescription("Repository test project");
        project.setCreatedAt(LocalDateTime.now());
        project.setOwner(savedUser);
        Project savedProject = projectRepository.save(project);

        Task todayTask = new Task();
        todayTask.setTitle("Task due today");
        todayTask.setDescription("This task is due today");
        todayTask.setStatus(TaskStatus.TODO);
        todayTask.setPriority(TaskPriority.HIGH);
        todayTask.setDueDate(LocalDate.now());
        todayTask.setCreatedAt(LocalDateTime.now());
        todayTask.setProject(savedProject);
        todayTask.setAssignee(savedUser);
        taskRepository.save(todayTask);

        Task tomorrowTask = new Task();
        tomorrowTask.setTitle("Task due tomorrow");
        tomorrowTask.setDescription("This task should not be returned");
        tomorrowTask.setStatus(TaskStatus.TODO);
        tomorrowTask.setPriority(TaskPriority.LOW);
        tomorrowTask.setDueDate(LocalDate.now().plusDays(1));
        tomorrowTask.setCreatedAt(LocalDateTime.now());
        tomorrowTask.setProject(savedProject);
        tomorrowTask.setAssignee(savedUser);
        taskRepository.save(tomorrowTask);

        List<Task> result = taskRepository.findTasksDueToday();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Task due today");
    }
}