package com.example.tasktracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTaskAssignedEmail(String toEmail, String taskTitle, String dueDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("New Task Assigned: " + taskTitle);
            message.setText(
                    "Hi,\n\n" +
                            "A new task has been assigned to you in TaskTracker.\n\n" +
                            "Task:     " + taskTitle + "\n" +
                            "Due Date: " + (dueDate != null ? dueDate : "No due date set") + "\n\n" +
                            "Log in to TaskTracker to view and update your task.\n\n" +
                            "Best regards,\nThe TaskTracker Team"
            );
            mailSender.send(message);
            log.info("Email sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("Could not send email to {}: {}", toEmail, e.getMessage());
        }
    }
}