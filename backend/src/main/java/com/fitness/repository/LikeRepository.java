package com.fitness.repository;

import com.fitness.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserIdAndParentTypeAndParentId(Long userId, Like.ParentType parentType, Long parentId);

    long countByParentTypeAndParentId(Like.ParentType parentType, Long parentId);

    void deleteByUserIdAndParentTypeAndParentId(Long userId, Like.ParentType parentType, Long parentId);
}
