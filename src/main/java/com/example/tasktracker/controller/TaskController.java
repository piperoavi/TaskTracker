package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TaskActivityResponse;
import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Create task — requesterId comes from the request body (set by frontend)
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(projectId, request));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<Page<TaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, status, pageable));
    }

    // Update task — requesterId comes from the request body
    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    // Delete task — requesterId passed as a query param ?requesterId=123
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @RequestParam Long requesterId) {
        taskService.deleteTask(id, requesterId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/due-today")
    public ResponseEntity<List<TaskResponse>> getTasksDueToday() {
        return ResponseEntity.ok(taskService.getTasksDueToday());
    }

    @GetMapping("/users/{userId}/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksAssignedToUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksAssignedToUser(userId));
    }

    @GetMapping("/tasks/{taskId}/activities")
    public ResponseEntity<List<TaskActivityResponse>> getActivities(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getActivitiesByTask(taskId));
    }
}