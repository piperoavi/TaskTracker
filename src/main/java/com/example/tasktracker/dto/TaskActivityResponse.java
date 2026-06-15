package com.example.tasktracker.dto;

import java.time.LocalDateTime;

public record TaskActivityResponse(
        Long id,
        String action,
        String description,
        LocalDateTime createdAt,
        Long taskId
) {
}