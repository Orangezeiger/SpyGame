package com.spygame.service;

import com.spygame.dto.RegisterUserRequest;
import com.spygame.dto.UserResponse;
import com.spygame.dto.LoginRequest;
import com.spygame.model.UserAccount;
import com.spygame.model.UserStats;
import com.spygame.repository.UserAccountRepository;
import com.spygame.repository.UserStatsRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserService {
    private final UserAccountRepository userAccountRepository;
    private final UserStatsRepository userStatsRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserAccountRepository userAccountRepository,
            UserStatsRepository userStatsRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userStatsRepository = userStatsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedUsername = request.getUsername().trim();

        userAccountRepository.findByEmail(normalizedEmail)
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Email already in use");
                });
        userAccountRepository.findByUsernameIgnoreCase(normalizedUsername)
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Username already in use");
                });

        UserAccount user = new UserAccount();
        user.setEmail(normalizedEmail);
        user.setUsername(normalizedUsername);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        UserAccount savedUser = userAccountRepository.save(user);
        savedUser.setLastSeenAt(Instant.now());
        savedUser = userAccountRepository.save(savedUser);

        UserStats stats = new UserStats();
        stats.setUser(savedUser);
        userStatsRepository.save(stats);

        return new UserResponse(savedUser.getId(), savedUser.getEmail(), savedUser.getUsername());
    }

    public UserResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        touchPresence(user);
        return new UserResponse(user.getId(), user.getEmail(), user.getUsername());
    }

    public UserAccount requireUser(Long userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void touchPresence(Long userId) {
        touchPresence(requireUser(userId));
    }

    public void touchPresence(UserAccount user) {
        user.setLastSeenAt(Instant.now());
        userAccountRepository.save(user);
    }

    public void updateRoomPresence(Long userId, String roomCode, boolean host, boolean passwordProtected) {
        if (userId == null) {
            return;
        }
        UserAccount user = requireUser(userId);
        user.setLastSeenAt(Instant.now());
        user.setActiveRoomCode(roomCode);
        user.setActiveRoomHost(host);
        user.setActiveRoomPasswordProtected(passwordProtected);
        userAccountRepository.save(user);
    }

    public void clearRoomPresence(Long userId) {
        if (userId == null) {
            return;
        }
        UserAccount user = requireUser(userId);
        user.setLastSeenAt(Instant.now());
        user.setActiveRoomCode(null);
        user.setActiveRoomHost(false);
        user.setActiveRoomPasswordProtected(false);
        userAccountRepository.save(user);
    }
}
