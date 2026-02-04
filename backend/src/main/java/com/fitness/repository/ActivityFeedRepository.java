package com.fitness.repository;

import com.fitness.model.ActivityFeed;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityFeedRepository extends JpaRepository<ActivityFeed, Long> {

    @Query("SELECT af FROM ActivityFeed af WHERE " +
            "(af.visibility = 'PUBLIC') OR " +
            "(af.visibility = 'FOLLOWERS_ONLY' AND af.originUser.id IN :followedIds) OR " +
            "(af.originUser.id = :currentUserId)")
    Slice<ActivityFeed> findFeedForUser(Long currentUserId, List<Long> followedIds, Pageable pageable);
}
