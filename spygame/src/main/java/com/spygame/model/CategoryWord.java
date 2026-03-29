package com.spygame.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "category_words")
public class CategoryWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private WordCategory category;

    @Column(nullable = false)
    private String value;

    public CategoryWord() {
    }

    public CategoryWord(WordCategory category, String value) {
        this.category = category;
        this.value = value;
    }

    public Long getId() {
        return id;
    }

    public WordCategory getCategory() {
        return category;
    }

    public String getValue() {
        return value;
    }
}
