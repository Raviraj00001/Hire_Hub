package com.hirehub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendShortlistEmail(String toEmail, String applicantName, String jobTitle) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Email is not configured. Please set spring.mail.username and related mail properties.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("HireHub Shortlist Update");
        message.setText(
                "Hello " + applicantName + ",\n\n" +
                "Your resume has been shortlisted for the role: " + jobTitle + ".\n\n" +
                "The recruiter may contact you soon for the next step.\n\n" +
                "Regards,\nHireHub"
        );

        mailSender.send(message);
    }
}
