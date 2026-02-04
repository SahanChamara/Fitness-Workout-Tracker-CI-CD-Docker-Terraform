package com.fitness.service;

import com.fitness.model.Exercise;
import com.fitness.model.User;
import com.fitness.model.Workout;
import com.fitness.model.WorkoutExercise;
import com.fitness.repository.ExerciseRepository;
import com.fitness.repository.UserRepository;
import com.fitness.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional
    public Workout createWorkout(Long userId, String title, String notes, OffsetDateTime startTime,
            OffsetDateTime endTime, Boolean isPrivate, List<WorkoutExerciseInput> exercises) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workout workout = Workout.builder()
                .user(user)
                .title(title)
                .notes(notes)
                .startTime(startTime)
                .endTime(endTime)
                .isPrivate(isPrivate)
                .build();

        if (exercises != null) {
            for (WorkoutExerciseInput input : exercises) {
                Exercise exercise = exerciseRepository.findById(input.exerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutExercise workoutExercise = WorkoutExercise.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .sets(input.sets())
                        .reps(input.reps())
                        .weightKg(input.weightKg())
                        .durationSeconds(input.durationSeconds())
                        .orderIndex(input.orderIndex())
                        .notes(input.notes())
                        .build();

                workout.getExercises().add(workoutExercise);
            }
        }

        return workoutRepository.save(workout);
    }

    public Page<Workout> getUserWorkouts(Long userId, Pageable pageable) {
        return workoutRepository.findByUserId(userId, pageable);
    }

    public Workout getWorkoutById(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    @Transactional
    public void deleteWorkout(Long workoutId, Long userId) {
        Workout workout = getWorkoutById(workoutId);
        if (!workout.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this workout");
        }
        workoutRepository.delete(workout);
    }

    // DTO for input
    public record WorkoutExerciseInput(Long exerciseId, Integer sets, Integer reps, java.math.BigDecimal weightKg,
            Integer durationSeconds, Integer orderIndex, String notes) {
    }
}
