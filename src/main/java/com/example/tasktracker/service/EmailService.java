package com.example.tasktracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTaskAssignedEmail(
            String to,
            String taskTitle,
            String dueDate) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("New Task Assigned");

        message.setText(
                "You have been assigned a new task:\n\n" +
                        "Task: " + taskTitle + "\n" +
                        "Due Date: " + dueDate
        );

        mailSender.send(message);
    }
}