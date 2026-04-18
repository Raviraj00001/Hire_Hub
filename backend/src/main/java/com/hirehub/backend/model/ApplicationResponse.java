package com.hirehub.backend.model;

public class ApplicationResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private Long jobId;
    private String jobTitle;
    private String resumeFileName;
    private String resumeUrl;
    private boolean shortlisted;

    public ApplicationResponse() {
    }

    public ApplicationResponse(Long id, Long userId, String userName, String userEmail, String userRole,
                               Long jobId, String jobTitle, String resumeFileName, String resumeUrl,
                               boolean shortlisted) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.resumeFileName = resumeFileName;
        this.resumeUrl = resumeUrl;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public boolean isShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }
}
