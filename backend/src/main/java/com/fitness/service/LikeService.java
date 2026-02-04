package com.fitness.service;

import com.fitness.model.Like;
import com.fitness.model.User;
import com.fitness.repository.LikeRepository;
import com.fitness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleLike(Long userId, Like.ParentType parentType, Long parentId) {
        if (likeRepository.existsByUserIdAndParentTypeAndParentId(userId, parentType, parentId)) {
            likeRepository.deleteByUserIdAndParentTypeAndParentId(userId, parentType, parentId);
            return false; // unliked
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Like like = Like.builder()
                    .user(user)
                    .parentType(parentType)
                    .parentId(parentId)
                    .build();

            likeRepository.save(like);
            return true; // liked
        }
    }

    public long getLikeCount(Like.ParentType parentType, Long parentId) {
        return likeRepository.countByParentTypeAndParentId(parentType, parentId);
    }

    public boolean isLiked(Long userId, Like.ParentType parentType, Long parentId) {
        return likeRepository.existsByUserIdAndParentTypeAndParentId(userId, parentType, parentId);
    }
}
