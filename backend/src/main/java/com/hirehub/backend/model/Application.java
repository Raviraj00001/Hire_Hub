package com.hirehub.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long jobId;
    private String resumeFileName;
    private String originalResumeFileName;
    private boolean shortlisted;

    public Application() {
    }

    public Application(Long id, Long userId, Long jobId, String resumeFileName, String originalResumeFileName,
                       boolean shortlisted) {
        this.id = id;
        this.userId = userId;
        this.jobId = jobId;
        this.resumeFileName = resumeFileName;
        this.originalResumeFileName = originalResumeFileName;
        this.shortlisted = shortlisted;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getOriginalResumeFileName() {
        return originalResumeFileName;
    }

    public void setOriginalResumeFileName(String originalResumeFileName) {
        this.originalResumeFileName = originalResumeFileName;
    }

    public boolean isShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }
}
