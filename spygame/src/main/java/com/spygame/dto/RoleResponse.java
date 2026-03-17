package com.spygame.dto;

public class RoleResponse {
    private final String role;
    private final String word;

    public RoleResponse(String role, String word) {
        this.role = role;
        this.word = word;
    }

    public String getRole() {
        return role;
    }

    public String getWord() {
        return word;
    }
}
