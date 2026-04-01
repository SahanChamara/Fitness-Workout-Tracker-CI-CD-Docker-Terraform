package com.fitness.repository;

import com.fitness.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByUserIdAndRefreshTokenHash(Long userId, String refreshTokenHash);
    Optional<Session> findByRefreshTokenHash(String refreshTokenHash);
    List<Session> findByUserId(Long userId);

    List<Session> findByExpiresAtBefore(OffsetDateTime now);

    void deleteByUserId(Long userId);
}
