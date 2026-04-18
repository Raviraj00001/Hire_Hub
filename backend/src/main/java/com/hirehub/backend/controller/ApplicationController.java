package com.hirehub.backend.controller;

import com.hirehub.backend.model.ApplicationResponse;
import com.hirehub.backend.model.ResumeAnalysisRequest;
import com.hirehub.backend.service.ApplicationService;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyToJob(@RequestParam Long userId,
                                        @RequestParam Long jobId,
                                        @RequestParam("resume") MultipartFile resume) {
        try {
            return ResponseEntity.ok(applicationService.applyToJob(userId, jobId, resume));
        } catch (RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationService.getApplicationsByUserId(userId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    @PostMapping("/{applicationId}/shortlist")
    public ResponseEntity<?> sendShortlistEmail(@PathVariable Long applicationId,
                                                @RequestParam Long employerId) {
        try {
            return ResponseEntity.ok(applicationService.sendShortlistEmail(applicationId, employerId));
        } catch (RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{applicationId}/analyze")
    public ResponseEntity<?> analyzeResume(@PathVariable Long applicationId,
                                           @RequestParam Long employerId,
                                           @org.springframework.web.bind.annotation.RequestBody ResumeAnalysisRequest request) {
        try {
            return ResponseEntity.ok(applicationService.analyzeResume(applicationId, employerId, request.getSpecification()));
        } catch (RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/resume/{fileName}")
    public ResponseEntity<?> downloadResume(@PathVariable String fileName) {
        try {
            Path resumePath = applicationService.getResumePath(fileName);
            if (!Files.exists(resumePath)) {
                return buildError("Resume not found", HttpStatus.NOT_FOUND);
            }

            Resource resource = new UrlResource(resumePath.toUri());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException | RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private ResponseEntity<Map<String, String>> buildError(String message, HttpStatus status) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}
