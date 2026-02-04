package com.fitness.service;

import com.fitness.model.Comment;
import com.fitness.model.User;
import com.fitness.repository.CommentRepository;
import com.fitness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment addComment(Long userId, Comment.ParentType parentType, Long parentId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .user(user)
                .parentType(parentType)
                .parentId(parentId)
                .content(content)
                .build();

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        comment.setDeletedAt(OffsetDateTime.now());
        commentRepository.save(comment);
    }

    public Page<Comment> getComments(Comment.ParentType parentType, Long parentId, Pageable pageable) {
        return commentRepository.findByParentTypeAndParentIdAndDeletedAtIsNull(parentType, parentId, pageable);
    }
}
