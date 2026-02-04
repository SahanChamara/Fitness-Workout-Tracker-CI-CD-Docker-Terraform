package com.fitness.service;

import com.fitness.model.Follow;
import com.fitness.model.User;
import com.fitness.repository.FollowRepository;
import com.fitness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public void followUser(Long followerId, Long followeeId) {
        if (followerId.equals(followeeId)) {
            throw new RuntimeException("Cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId)) {
            throw new RuntimeException("Already following");
        }

        User follower = userRepository.findById(followerId).orElseThrow();
        User followee = userRepository.findById(followeeId).orElseThrow();

        Follow follow = Follow.builder()
                .follower(follower)
                .followee(followee)
                .build();

        followRepository.save(follow);

        follower.setFollowingCount(follower.getFollowingCount() + 1);
        followee.setFollowersCount(followee.getFollowersCount() + 1);

        userRepository.save(follower);
        userRepository.save(followee);
    }

    @Transactional
    public void unfollowUser(Long followerId, Long followeeId) {
        if (!followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId)) {
            throw new RuntimeException("Not following");
        }

        followRepository.deleteByFollowerIdAndFolloweeId(followerId, followeeId);

        User follower = userRepository.findById(followerId).orElseThrow();
        User followee = userRepository.findById(followeeId).orElseThrow();

        follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        followee.setFollowersCount(Math.max(0, followee.getFollowersCount() - 1));

        userRepository.save(follower);
        userRepository.save(followee);
    }
}
