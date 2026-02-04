package com.fitness.repository;

import com.fitness.model.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    Page<Workout> findByUserId(Long userId, Pageable pageable);

    Page<Workout> findByUserIdAndIsPrivateFalse(Long userId, Pageable pageable);

    List<Workout> findByUserIdAndStartTimeBetween(Long userId, OffsetDateTime start, OffsetDateTime end);
}
