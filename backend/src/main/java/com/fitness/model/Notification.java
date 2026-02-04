package com.fitness.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(columnDefinition = "jsonb")
    private String payload;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    public enum NotificationType {
        NEW_FOLLOW, NEW_COMMENT, NEW_LIKE, ACTIVITY_FROM_FOLLOWER
    }
}
