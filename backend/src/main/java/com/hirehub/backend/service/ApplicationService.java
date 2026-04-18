package com.hirehub.backend.service;

import com.hirehub.backend.model.Application;
import com.hirehub.backend.model.ApplicationResponse;
import com.hirehub.backend.model.Job;
import com.hirehub.backend.model.ResumeAnalysisResponse;
import com.hirehub.backend.model.User;
import com.hirehub.backend.model.UserRole;
import com.hirehub.backend.repository.ApplicationRepository;
import com.hirehub.backend.repository.JobRepository;
import com.hirehub.backend.repository.UserRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;
    private final Path uploadDirectory = Paths.get("uploads");

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              JobRepository jobRepository,
                              EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.emailService = emailService;
    }

    public ApplicationResponse applyToJob(Long userId, Long jobId, MultipartFile resume) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (user.getRole() != UserRole.JOB_SEEKER) {
            throw new RuntimeException("Only job seekers can apply");
        }

        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException("Resume is required");
        }

        if (applicationRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new RuntimeException("You already applied to this job");
        }

        Application application = new Application();
        application.setUserId(user.getId());
        application.setJobId(job.getId());
        application.setResumeFileName(saveResume(resume, user.getId(), job.getId()));
        application.setOriginalResumeFileName(resume.getOriginalFilename());
        application.setShortlisted(false);

        return mapToResponse(applicationRepository.save(application));
    }

    public ApplicationResponse sendShortlistEmail(Long applicationId, Long employerId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User applicant = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new RuntimeException("Applicant not found"));
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getRole() != UserRole.EMPLOYER) {
            throw new RuntimeException("Only employers can send shortlist emails");
        }

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You can only notify applicants for your own job posts");
        }

        emailService.sendShortlistEmail(applicant.getEmail(), applicant.getName(), job.getTitle());
        application.setShortlisted(true);
        return mapToResponse(applicationRepository.save(application));
    }

    public ResumeAnalysisResponse analyzeResume(Long applicationId, Long employerId, String specification) {
        if (specification == null || specification.isBlank()) {
            throw new RuntimeException("Specification is required for analysis");
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User applicant = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new RuntimeException("Applicant not found"));
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getRole() != UserRole.EMPLOYER) {
            throw new RuntimeException("Only employers can analyze resumes");
        }

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You can only analyze applicants for your own job posts");
        }

        if (application.getResumeFileName() == null || application.getResumeFileName().isBlank()) {
            throw new RuntimeException("Resume not found for this application");
        }

        String resumeText = extractResumeText(getResumePath(application.getResumeFileName()));
        Set<String> requiredSkills = parseSpecification(specification);
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : requiredSkills) {
            if (resumeText.contains(skill.toLowerCase(Locale.ENGLISH))) {
                matchedSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        int matchPercentage = requiredSkills.isEmpty()
                ? 0
                : (matchedSkills.size() * 100) / requiredSkills.size();

        String recommendation;
        if (matchPercentage >= 75) {
            recommendation = "Strong Match";
        } else if (matchPercentage >= 45) {
            recommendation = "Moderate Match";
        } else {
            recommendation = "Low Match";
        }

        String summary = buildAnalysisSummary(applicant.getName(), matchedSkills, missingSkills, recommendation);

        return new ResumeAnalysisResponse(
                application.getId(),
                applicant.getName(),
                applicant.getEmail(),
                job.getTitle(),
                specification,
                new ArrayList<>(requiredSkills),
                matchedSkills,
                missingSkills,
                matchPercentage,
                recommendation,
                summary
        );
    }

    public List<ApplicationResponse> getApplicationsByUserId(Long userId) {
        List<ApplicationResponse> responses = new ArrayList<>();
        for (Application application : applicationRepository.findByUserId(userId)) {
            responses.add(mapToResponse(application));
        }
        return responses;
    }

    public List<ApplicationResponse> getApplicationsByJobId(Long jobId) {
        List<ApplicationResponse> responses = new ArrayList<>();
        for (Application application : applicationRepository.findByJobId(jobId)) {
            responses.add(mapToResponse(application));
        }
        return responses;
    }

    public Path getResumePath(String fileName) {
        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException exception) {
            throw new RuntimeException("Could not prepare resume folder");
        }

        Path resolvedPath = uploadDirectory.resolve(fileName).normalize();
        if (!resolvedPath.toAbsolutePath().startsWith(uploadDirectory.toAbsolutePath())) {
            throw new RuntimeException("Invalid resume file");
        }
        return resolvedPath;
    }

    private String saveResume(MultipartFile resume, Long userId, Long jobId) {
        try {
            Files.createDirectories(uploadDirectory);
            String safeOriginalName = resume.getOriginalFilename() == null
                    ? "resume.pdf"
                    : resume.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String storedFileName = System.currentTimeMillis() + "_user_" + userId + "_job_" + jobId + "_" + safeOriginalName;

            try (InputStream inputStream = resume.getInputStream()) {
                Files.copy(inputStream, uploadDirectory.resolve(storedFileName), StandardCopyOption.REPLACE_EXISTING);
            }

            return storedFileName;
        } catch (IOException exception) {
            throw new RuntimeException("Could not upload resume");
        }
    }

    private Set<String> parseSpecification(String specification) {
        return Arrays.stream(specification.split("[,\\n]"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String extractResumeText(Path resumePath) {
        String fileName = resumePath.getFileName().toString().toLowerCase(Locale.ENGLISH);

        try {
            if (fileName.endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(resumePath.toFile())) {
                    return new PDFTextStripper().getText(document).toLowerCase(Locale.ENGLISH);
                }
            }

            if (fileName.endsWith(".docx")) {
                try (InputStream inputStream = Files.newInputStream(resumePath);
                     XWPFDocument document = new XWPFDocument(inputStream)) {
                    return document.getParagraphs().stream()
                            .map(paragraph -> paragraph.getText().toLowerCase(Locale.ENGLISH))
                            .collect(Collectors.joining(" "));
                }
            }

            if (fileName.endsWith(".txt")) {
                return Files.readString(resumePath).toLowerCase(Locale.ENGLISH);
            }

            throw new RuntimeException("Resume analysis currently supports PDF, DOCX, and TXT files");
        } catch (IOException exception) {
            throw new RuntimeException("Could not read resume for analysis");
        }
    }

    private String buildAnalysisSummary(String applicantName, List<String> matchedSkills,
                                        List<String> missingSkills, String recommendation) {
        String matchedText = matchedSkills.isEmpty() ? "no required skills matched" : "matched: " + String.join(", ", matchedSkills);
        String missingText = missingSkills.isEmpty() ? "no major skill gaps" : "missing: " + String.join(", ", missingSkills);
        return applicantName + " has " + matchedText + "; " + missingText + ". Recommendation: " + recommendation + ".";
    }

    private ApplicationResponse mapToResponse(Application application) {
        User user = userRepository.findById(application.getUserId()).orElse(null);
        Job job = jobRepository.findById(application.getJobId()).orElse(null);

        String resumeLabel = application.getOriginalResumeFileName();
        if (resumeLabel == null || resumeLabel.isBlank()) {
            resumeLabel = application.getResumeFileName();
        }

        return new ApplicationResponse(
                application.getId(),
                application.getUserId(),
                user != null ? user.getName() : "Unknown User",
                user != null ? user.getEmail() : "",
                user != null && user.getRole() != null ? user.getRole().name() : "",
                application.getJobId(),
                job != null ? job.getTitle() : "Unknown Job",
                resumeLabel,
                "/applications/resume/" + application.getResumeFileName(),
                application.isShortlisted()
        );
    }
}
