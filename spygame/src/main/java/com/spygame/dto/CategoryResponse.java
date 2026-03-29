package com.spygame.dto;

import java.util.List;

public class CategoryResponse {
    private final Long id;
    private final String name;
    private final boolean defaultCategory;
    private final Long createdByUserId;
    private final List<String> words;

    public CategoryResponse(Long id, String name, boolean defaultCategory, Long createdByUserId, List<String> words) {
        this.id = id;
        this.name = name;
        this.defaultCategory = defaultCategory;
        this.createdByUserId = createdByUserId;
        this.words = words;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isDefaultCategory() {
        return defaultCategory;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public List<String> getWords() {
        return words;
    }
}
