package com.spygame.dto;

public class UserResponse {
    private final Long id;
    private final String email;
    private final String username;

    public UserResponse(Long id, String email, String username) {
        this.id = id;
        this.email = email;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }
}
