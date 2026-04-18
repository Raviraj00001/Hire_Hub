package com.hirehub.backend.repository;

import com.hirehub.backend.model.Application;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    List<Application> findByJobId(Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}
