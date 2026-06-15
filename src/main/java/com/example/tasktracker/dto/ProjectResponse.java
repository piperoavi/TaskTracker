package com.example.tasktracker.dto;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        Long ownerId,
        String ownerUsername
) {
}