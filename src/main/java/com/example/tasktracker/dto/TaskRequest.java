package com.example.tasktracker.dto;

import com.example.tasktracker.entity.TaskPriority;
import com.example.tasktracker.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String title;

    private String description;

    @NotNull
    private TaskStatus status;

    @NotNull
    private TaskPriority priority;

    private LocalDate dueDate;

    @NotNull
    private Long assigneeId;

    // ── Who is making this request (the logged-in user) ──
    // Used to verify project ownership before creating a task.
    // Not saved to DB — only used for the ownership check.
    @NotNull
    private Long requesterId;
}