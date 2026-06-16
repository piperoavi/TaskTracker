package com.example.tasktracker.service;

import com.example.tasktracker.dto.TaskActivityResponse;
import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.Project;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.TaskActivity;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.ProjectRepository;
import com.example.tasktracker.repository.TaskActivityRepository;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskActivityRepository taskActivityRepository;
    private final EmailService emailService;

    public TaskResponse createTask(Long projectId, TaskRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ── OWNERSHIP CHECK ──────────────────────────────────────────
        // Only the project owner can create tasks inside the project
        if (!project.getOwner().getId().equals(request.getRequesterId())) {
            throw new RuntimeException(
                    "You are not the owner of project '" + project.getName() +
                            "'. Only the project owner can create tasks."
            );
        }
        // ─────────────────────────────────────────────────────────────

        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setCreatedAt(LocalDateTime.now());
        task.setProject(project);
        task.setAssignee(assignee);

        Task savedTask = taskRepository.save(task);

        logActivity(savedTask, "TASK_CREATED", "Task was created");

        try {
            emailService.sendTaskAssignedEmail(
                    assignee.getEmail(),
                    savedTask.getTitle(),
                    savedTask.getDueDate() != null ? savedTask.getDueDate().toString() : null
            );
        } catch (Exception e) {
            System.out.println("Email could not be sent: " + e.getMessage());
        }

        return toTaskResponse(savedTask);
    }

    public TaskResponse getTaskById(Long id) {
        return toTaskResponse(findTaskEntityById(id));
    }

    public Page<TaskResponse> getTasksByProject(Long projectId, TaskStatus status, Pageable pageable) {
        Page<Task> tasks = status != null
                ? taskRepository.findByProjectIdAndStatus(projectId, status, pageable)
                : taskRepository.findByProjectId(projectId, pageable);
        return tasks.map(this::toTaskResponse);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskEntityById(id);

        // ── PERMISSION CHECK ─────────────────────────────────────────
        // Only the project owner or the task assignee can update a task
        Long ownerId    = task.getProject().getOwner().getId();
        Long assigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        Long requesterId = request.getRequesterId();

        boolean isOwner    = ownerId.equals(requesterId);
        boolean isAssignee = assigneeId != null && assigneeId.equals(requesterId);

        if (!isOwner && !isAssignee) {
            throw new RuntimeException(
                    "Permission denied. Only the project owner or the task assignee can edit this task."
            );
        }
        // ─────────────────────────────────────────────────────────────

        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignee(assignee);

        Task updatedTask = taskRepository.save(task);
        logActivity(updatedTask, "TASK_UPDATED", "Task was updated");
        return toTaskResponse(updatedTask);
    }

    public void deleteTask(Long id, Long requesterId) {
        Task task = findTaskEntityById(id);

        // ── PERMISSION CHECK ─────────────────────────────────────────
        // Only the project owner can delete a task
        Long ownerId = task.getProject().getOwner().getId();
        if (!ownerId.equals(requesterId)) {
            throw new RuntimeException(
                    "Permission denied. Only the project owner can delete tasks."
            );
        }
        // ─────────────────────────────────────────────────────────────

        // Log activity BEFORE deleting the task activities first,
        // then delete the task (avoids TransientObjectException)
        taskActivityRepository.deleteByTaskId(id);
        taskRepository.delete(task);
    }

    public List<TaskResponse> getTasksDueToday() {
        return taskRepository.findTasksDueToday().stream().map(this::toTaskResponse).toList();
    }

    public List<TaskResponse> getTasksAssignedToUser(Long userId) {
        return taskRepository.findByAssigneeId(userId).stream().map(this::toTaskResponse).toList();
    }

    public List<TaskActivityResponse> getActivitiesByTask(Long taskId) {
        return taskActivityRepository.findByTaskId(taskId).stream().map(this::toTaskActivityResponse).toList();
    }

    private Task findTaskEntityById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private void logActivity(Task task, String action, String description) {
        TaskActivity activity = new TaskActivity();
        activity.setTask(task);
        activity.setAction(action);
        activity.setDescription(description);
        activity.setCreatedAt(LocalDateTime.now());
        taskActivityRepository.save(activity);
    }

    private TaskResponse toTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getAssignee() != null ? task.getAssignee().getUsername() : null
        );
    }

    private TaskActivityResponse toTaskActivityResponse(TaskActivity activity) {
        return new TaskActivityResponse(
                activity.getId(),
                activity.getAction(),
                activity.getDescription(),
                activity.getCreatedAt(),
                activity.getTask().getId()
        );
    }
}