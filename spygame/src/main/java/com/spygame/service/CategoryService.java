package com.spygame.service;

import com.spygame.dto.CategoryResponse;
import com.spygame.model.WordCategory;
import com.spygame.repository.WordCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final WordCategoryRepository categoryRepository;

    public CategoryService(WordCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(WordCategory category) {
        List<String> words = category.getWords().stream()
                .map(word -> word.getValue())
                .toList();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.isDefaultCategory(),
                words
        );
    }
}
