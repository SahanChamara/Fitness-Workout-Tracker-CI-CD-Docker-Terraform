package com.fitness.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_feed")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityFeed extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_user_id", nullable = false)
    private User originUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Column(columnDefinition = "jsonb")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    public enum ActivityType {
        WORKOUT_CREATED, ROUTINE_PUBLISHED, USER_FOLLOWED
    }

    public enum Visibility {
        PUBLIC, FOLLOWERS_ONLY, PRIVATE
    }
}
