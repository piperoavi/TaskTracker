package com.example.tasktracker.dto;

import com.example.tasktracker.entity.TaskPriority;
import com.example.tasktracker.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        Long projectId,
        String projectName,
        Long assigneeId,
        String assigneeUsername
) {
}