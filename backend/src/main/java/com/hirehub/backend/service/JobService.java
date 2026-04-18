package com.hirehub.backend.service;

import com.hirehub.backend.model.Job;
import com.hirehub.backend.model.User;
import com.hirehub.backend.model.UserRole;
import com.hirehub.backend.repository.JobRepository;
import com.hirehub.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job createJob(Job job) {
        User employer = userRepository.findById(job.getEmployerId())
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getRole() != UserRole.EMPLOYER) {
            throw new RuntimeException("Only employers can post jobs");
        }

        return jobRepository.save(job);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public List<Job> getJobsByEmployerId(Long employerId) {
        return jobRepository.findByEmployerId(employerId);
    }

    public void deleteJob(Long jobId, Long employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getRole() != UserRole.EMPLOYER) {
            throw new RuntimeException("Only employers can delete jobs");
        }

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You can only delete your own job posts");
        }

        jobRepository.delete(job);
    }
}
