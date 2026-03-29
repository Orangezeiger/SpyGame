package com.spygame.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_categories")
public class WordCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean defaultCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserAccount createdBy;

    @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
    private List<CategoryWord> words = new ArrayList<>();

    public WordCategory() {
    }

    public WordCategory(String name, boolean defaultCategory, UserAccount createdBy) {
        this.name = name;
        this.defaultCategory = defaultCategory;
        this.createdBy = createdBy;
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

    public UserAccount getCreatedBy() {
        return createdBy;
    }

    public List<CategoryWord> getWords() {
        return words;
    }
}
