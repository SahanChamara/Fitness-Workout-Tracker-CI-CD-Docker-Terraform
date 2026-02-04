package com.fitness.service;

import com.fitness.model.ActivityFeed;
import com.fitness.repository.ActivityFeedRepository;
import com.fitness.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityFeedService {

    private final ActivityFeedRepository activityFeedRepository;
    private final FollowRepository followRepository;

    public Slice<ActivityFeed> getFeed(Long userId, Pageable pageable) {
        List<Long> followedIds = followRepository.findFolloweeIds(userId);
        return activityFeedRepository.findFeedForUser(userId, followedIds, pageable);
    }
}
