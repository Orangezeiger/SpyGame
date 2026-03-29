package com.spygame.service;

import com.spygame.dto.CategoryResponse;
import com.spygame.dto.CreateCategoryRequest;
import com.spygame.model.CategoryWord;
import com.spygame.model.UserAccount;
import com.spygame.model.WordCategory;
import com.spygame.repository.CategoryWordRepository;
import com.spygame.repository.WordCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final WordCategoryRepository categoryRepository;
    private final CategoryWordRepository wordRepository;
    private final UserService userService;

    public CategoryService(
            WordCategoryRepository categoryRepository,
            CategoryWordRepository wordRepository,
            UserService userService
    ) {
        this.categoryRepository = categoryRepository;
        this.wordRepository = wordRepository;
        this.userService = userService;
    }

    public List<CategoryResponse> getAllCategories(Long userId) {
        return categoryRepository.findByDefaultCategoryTrueOrCreatedByIdOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse createCategory(CreateCategoryRequest request) {
        UserAccount user = userService.requireUser(request.getUserId());
        String categoryName = request.getName().trim();
        categoryRepository.findByNameIgnoreCase(categoryName)
                .ifPresent(existing -> {
                    if (existing.isDefaultCategory() || existing.getCreatedBy() == null
                            || existing.getCreatedBy().getId().equals(user.getId())) {
                        throw new IllegalArgumentException("Category name already exists");
                    }
                });

        List<String> cleanedWords = request.getWords().stream()
                .map(String::trim)
                .filter(word -> !word.isBlank())
                .distinct()
                .toList();
        if (cleanedWords.size() < 3) {
            throw new IllegalArgumentException("Please add at least 3 words");
        }

        WordCategory category = categoryRepository.save(new WordCategory(categoryName, false, user));
        List<CategoryWord> words = cleanedWords.stream()
                .map(word -> new CategoryWord(category, word))
                .toList();
        wordRepository.saveAll(words);
        return toResponse(categoryRepository.findById(category.getId()).orElseThrow());
    }

    public WordCategory requireCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    }

    private CategoryResponse toResponse(WordCategory category) {
        List<String> words = category.getWords().stream()
                .map(word -> word.getValue())
                .toList();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.isDefaultCategory(),
                category.getCreatedBy() == null ? null : category.getCreatedBy().getId(),
                words
        );
    }
}
