package com.fitness.service;

import com.fitness.model.User;
import com.fitness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, String displayName, String bio, String avatarUrl) {
        User user = getUserById(userId);
        if (displayName != null)
            user.setDisplayName(displayName);
        if (bio != null)
            user.setBio(bio);
        if (avatarUrl != null)
            user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }
}
