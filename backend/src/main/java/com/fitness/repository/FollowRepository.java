package com.fitness.repository;

import com.fitness.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    long countByFollowerId(Long followerId);

    long countByFolloweeId(Long followeeId);

    void deleteByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    @Query("SELECT f.follower.id FROM Follow f WHERE f.followee.id = :userId")
    List<Long> findFollowerIds(Long userId);

    @Query("SELECT f.followee.id FROM Follow f WHERE f.follower.id = :userId")
    List<Long> findFolloweeIds(Long userId);
}
