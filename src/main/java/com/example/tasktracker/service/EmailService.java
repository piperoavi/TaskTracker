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

    /**
     * Signature matches your existing TaskService call:
     *   emailService.sendTaskAssignedEmail(
     *       assignee.getEmail(),
     *       savedTask.getTitle(),
     *       savedTask.getDueDate().toString()
     *   );
     */
    public void sendTaskAssignedEmail(String toEmail, String taskTitle, String dueDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("📋 New Task Assigned: " + taskTitle);
            message.setText(buildEmailBody(toEmail, taskTitle, dueDate));

            mailSender.send(message);
            log.info("Task assignment email sent to {}", toEmail);

        } catch (Exception e) {
            log.warn("Could not send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailBody(String toEmail, String taskTitle, String dueDate) {
        return String.format("""
                Hi,

                A new task has been assigned to you in TaskTracker.

                ──────────────────────────────
                Task:     %s
                Due Date: %s
                ──────────────────────────────

                Log in to TaskTracker to view and update your task.

                Best regards,
                The TaskTracker Team
                """,
                taskTitle,
                dueDate != null ? dueDate : "No due date set"
        );
    }
}