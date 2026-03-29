package com.spygame.dto;

import java.util.List;

public class CategoryResponse {
    private final Long id;
    private final String name;
    private final boolean defaultCategory;
    private final List<String> words;

    public CategoryResponse(Long id, String name, boolean defaultCategory, List<String> words) {
        this.id = id;
        this.name = name;
        this.defaultCategory = defaultCategory;
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

    public List<String> getWords() {
        return words;
    }
}
