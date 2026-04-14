package com.fitness.service;

import com.fitness.model.Session;
import com.fitness.model.User;
import com.fitness.repository.SessionRepository;
import com.fitness.repository.UserRepository;
import com.fitness.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final SessionRepository sessionRepository;
    private static final int REFRESH_TOKEN_TTL_DAYS = 7;

    @Transactional
    public Map<String, String> signup(String username, String email, String password, String displayName) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .displayName(displayName)
                .status(User.UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        persistSession(user, refreshToken, "web-signup");
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("username", username);
        return response;
    }

    @Transactional
    public Map<String, String> login(String username, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        persistSession(user, refreshToken, "web-login");
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("username", username);
        return response;
    }

    @Transactional
    public Map<String, String> refreshToken(String refreshToken) {
        String username = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtUtil.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Invalid refresh token");
        }

        Session currentSession = sessionRepository.findByUserId(user.getId()).stream()
                .filter(session -> passwordEncoder.matches(refreshToken, session.getRefreshTokenHash()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (currentSession.getRevokedAt() != null) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (currentSession.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("Refresh token has expired");
        }

        if (Objects.nonNull(currentSession.getReplacedByHash())) {
            throw new RuntimeException("Refresh token reuse detected");
        }

        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        String newRefreshHash = passwordEncoder.encode(newRefreshToken);

        currentSession.setRevokedAt(OffsetDateTime.now());
        currentSession.setReplacedByHash(newRefreshHash);
        sessionRepository.save(currentSession);

        sessionRepository.save(Session.builder()
                .user(user)
                .refreshTokenHash(newRefreshHash)
                .deviceInfo("web-refresh")
                .expiresAt(OffsetDateTime.now().plusDays(REFRESH_TOKEN_TTL_DAYS))
                .build());

        Map<String, String> response = new HashMap<>();
        response.put("token", newAccessToken);
        response.put("refreshToken", newRefreshToken);
        response.put("username", username);
        return response;
    }

    @Transactional
    public void logoutAllSessions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        sessionRepository.deleteByUserId(user.getId());
    }

    private void persistSession(User user, String refreshToken, String deviceInfo) {
        sessionRepository.save(Session.builder()
                .user(user)
                .refreshTokenHash(passwordEncoder.encode(refreshToken))
                .deviceInfo(deviceInfo)
                .expiresAt(OffsetDateTime.now().plusDays(REFRESH_TOKEN_TTL_DAYS))
                .build());
    }
}
