package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskActivityResponse;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/projects/{projectId}/tasks")
    public TaskResponse createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {

        return taskService.createTask(projectId, request);
    }

    @GetMapping("/tasks/{id}")
    public TaskResponse getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @GetMapping("/projects/{projectId}/tasks")
    public Page<TaskResponse> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            Pageable pageable) {

        return taskService.getTasksByProject(projectId, status, pageable);
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/tasks/due-today")
    public List<TaskResponse> getTasksDueToday() {
        return taskService.getTasksDueToday();
    }

    @GetMapping("/tasks/{taskId}/activities")
    public List<TaskActivityResponse> getActivitiesByTask(
            @PathVariable Long taskId) {

        return taskService.getActivitiesByTask(taskId);
    }

    @GetMapping("/users/{userId}/tasks")
    public List<TaskResponse> getTasksAssignedToUser(
            @PathVariable Long userId) {

        return taskService.getTasksAssignedToUser(userId);
    }
}