package com.spygame.repository;

import com.spygame.model.WordCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WordCategoryRepository extends JpaRepository<WordCategory, Long> {
    Optional<WordCategory> findByNameIgnoreCase(String name);

    List<WordCategory> findByDefaultCategoryTrueOrCreatedByIdOrderByNameAsc(Long createdById);
}
