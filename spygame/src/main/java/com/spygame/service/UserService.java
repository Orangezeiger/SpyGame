package com.spygame.service;

import com.spygame.dto.RegisterUserRequest;
import com.spygame.dto.UserResponse;
import com.spygame.dto.LoginRequest;
import com.spygame.model.UserAccount;
import com.spygame.model.UserStats;
import com.spygame.repository.UserAccountRepository;
import com.spygame.repository.UserStatsRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public UserResponse register(RegisterUserRequest request) {
        userAccountRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Email already in use");
                });
        userAccountRepository.findByUsername(request.getUsername().trim())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Username already in use");
                });

        UserAccount user = new UserAccount();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setUsername(request.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        UserAccount savedUser = userAccountRepository.save(user);

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
        return new UserResponse(user.getId(), user.getEmail(), user.getUsername());
    }

    public UserAccount requireUser(Long userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
