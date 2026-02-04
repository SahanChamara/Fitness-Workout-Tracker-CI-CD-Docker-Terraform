package com.fitness.service;

import com.fitness.model.Routine;
import com.fitness.repository.RoutineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoutineService {

    private final RoutineRepository routineRepository;

    public Routine getRoutineById(Long id) {
        return routineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
    }

    public List<Routine> getUserRoutines(Long userId) {
        return routineRepository.findByOwnerId(userId);
    }
}
