package com.fitness.repository;

import com.fitness.model.Routine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByOwnerId(Long ownerId);

    Page<Routine> findByIsPublicTrue(Pageable pageable);
}
