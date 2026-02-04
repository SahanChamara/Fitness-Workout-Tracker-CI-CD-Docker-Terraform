package com.fitness.graphql;

import com.fitness.model.*;
import com.fitness.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class QueryResolver {

    private final UserService userService;
    private final WorkoutService workoutService;
    private final RoutineService routineService;
    private final ExerciseService exerciseService;
    private final ActivityFeedService activityFeedService;
    private final CommentService commentService;

    @QueryMapping
    public User me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @QueryMapping
    public User user(@Argument Long id, @Argument String username) {
        if (id != null) {
            return userService.getUserById(id);
        } else if (username != null) {
            return userService.getUserByUsername(username);
        }
        throw new RuntimeException("Must provide id or username");
    }

    @QueryMapping
    public Workout workout(@Argument Long id) {
        return workoutService.getWorkoutById(id);
    }

    @QueryMapping
    public WorkoutPage userWorkouts(@Argument Long userId, @Argument int page, @Argument int size) {
        var result = workoutService.getUserWorkouts(userId,
                PageRequest.of(page, size, Sort.by("startTime").descending()));
        return new WorkoutPage(result.getContent(), result.getTotalPages(), (int) result.getTotalElements());
    }

    @QueryMapping
    public Routine routine(@Argument Long id) {
        return routineService.getRoutineById(id);
    }

    @QueryMapping
    public List<Routine> userRoutines(@Argument Long userId) {
        return routineService.getUserRoutines(userId);
    }

    @QueryMapping
    public List<Exercise> exercises(@Argument String query) {
        if (query != null && !query.isBlank()) {
            return exerciseService.searchExercises(query);
        }
        return exerciseService.getAllExercises();
    }

    @QueryMapping
    public Exercise exercise(@Argument Long id) {
        return exerciseService.getExerciseById(id);
    }

    @QueryMapping
    public FeedSlice feed(@Argument int page, @Argument int size) {
        User currentUser = me();
        Slice<ActivityFeed> slice = activityFeedService.getFeed(currentUser.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return new FeedSlice(slice.getContent(), slice.hasNext());
    }

    @QueryMapping
    public CommentPage comments(@Argument Comment.ParentType parentType, @Argument Long parentId, @Argument int page,
            @Argument int size) {
        var result = commentService.getComments(parentType, parentId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return new CommentPage(result.getContent(), result.getTotalPages(), (int) result.getTotalElements());
    }

    // DTOs
    public record WorkoutPage(List<Workout> content, int totalPages, int totalElements) {
    }

    public record FeedSlice(List<ActivityFeed> content, boolean hasNext) {
    }

    public record CommentPage(List<Comment> content, int totalPages, int totalElements) {
    }
}
