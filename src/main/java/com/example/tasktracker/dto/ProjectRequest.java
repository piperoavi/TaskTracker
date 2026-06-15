package com.example.tasktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 50,
            message = "Project name must be between 3 and 50 characters")
    private String name;

    private String description;

    @NotNull(message = "Owner id is required")
    private Long ownerId;
}