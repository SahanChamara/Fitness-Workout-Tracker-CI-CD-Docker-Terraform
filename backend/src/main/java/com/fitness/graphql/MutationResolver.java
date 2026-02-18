package com.fitness.graphql;

import com.fitness.model.*;
import com.fitness.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MutationResolver {

    private final AuthService authService;
    private final WorkoutService workoutService;
    private final FollowService followService;
    private final LikeService likeService;
    private final CommentService commentService;
    private final UserService userService;

    @Autowired(required = false)
    private MediaService mediaService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @MutationMapping
    public AuthPayload signup(@Argument SignupInput input) {
        Map<String, String> result = authService.signup(input.username(), input.email(), input.password(),
                input.displayName());
        return new AuthPayload(result.get("token"), result.get("username"));
    }

    @MutationMapping
    public AuthPayload login(@Argument LoginInput input) {
        Map<String, String> result = authService.login(input.username(), input.password());
        return new AuthPayload(result.get("token"), result.get("username"));
    }

    @MutationMapping
    public Workout createWorkout(@Argument CreateWorkoutInput input) {
        User user = getCurrentUser();
        return workoutService.createWorkout(
                user.getId(),
                input.title(),
                input.notes(),
                input.startTime(),
                input.endTime(),
                input.isPrivate(),
                input.exercises());
    }

    @MutationMapping
    public Boolean deleteWorkout(@Argument Long id) {
        User user = getCurrentUser();
        workoutService.deleteWorkout(id, user.getId());
        return true;
    }

    @MutationMapping
    public Boolean follow(@Argument Long userId) {
        User currentUser = getCurrentUser();
        followService.followUser(currentUser.getId(), userId);
        return true;
    }

    @MutationMapping
    public Boolean unfollow(@Argument Long userId) {
        User currentUser = getCurrentUser();
        followService.unfollowUser(currentUser.getId(), userId);
        return true;
    }

    @MutationMapping
    public Boolean like(@Argument Like.ParentType parentType, @Argument Long parentId) {
        User currentUser = getCurrentUser();
        return likeService.toggleLike(currentUser.getId(), parentType, parentId);
    }

    @MutationMapping
    public Comment addComment(@Argument AddCommentInput input) {
        User currentUser = getCurrentUser();
        return commentService.addComment(currentUser.getId(), input.parentType(), input.parentId(), input.content());
    }

    @MutationMapping
    public Boolean deleteComment(@Argument Long id) {
        User currentUser = getCurrentUser();
        commentService.deleteComment(id, currentUser.getId());
        return true;
    }

    @MutationMapping
    public MediaService.PresignedUrl presignUpload(@Argument String contentType, @Argument String folder) {
        if (mediaService == null) {
            throw new IllegalStateException("S3 media service is not configured");
        }
        return mediaService.presignUpload(contentType, folder);
    }

    @MutationMapping
    public User updateProfile(@Argument UpdateProfileInput input) {
        User currentUser = getCurrentUser();
        return userService.updateProfile(currentUser.getId(), input.displayName(), input.bio(), input.avatarUrl());
    }

    @MutationMapping
    public AuthPayload refreshToken(@Argument String token) {
        Map<String, String> result = authService.refreshToken(token);
        return new AuthPayload(result.get("token"), result.get("username"));
    }

    // Input Records
    public record SignupInput(String username, String email, String password, String displayName) {
    }

    public record LoginInput(String username, String password) {
    }

    public record CreateWorkoutInput(String title, String notes, OffsetDateTime startTime, OffsetDateTime endTime,
            Boolean isPrivate, List<WorkoutService.WorkoutExerciseInput> exercises) {
    }

    public record AddCommentInput(Comment.ParentType parentType, Long parentId, String content) {
    }

    public record UpdateProfileInput(String displayName, String bio, String avatarUrl) {
    }

    // Output Records
    public record AuthPayload(String token, String username) {
    }
}
