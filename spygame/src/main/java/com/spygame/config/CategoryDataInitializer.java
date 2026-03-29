package com.spygame.config;

import com.spygame.model.CategoryWord;
import com.spygame.model.WordCategory;
import com.spygame.repository.CategoryWordRepository;
import com.spygame.repository.WordCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class CategoryDataInitializer {
    @Bean
    CommandLineRunner categorySeeder(
            WordCategoryRepository categoryRepository,
            CategoryWordRepository wordRepository
    ) {
        return args -> {
            if (categoryRepository.count() > 0) {
                return;
            }

            Map<String, List<String>> defaults = Map.of(
                    "Orte", List.of(
                            "Flughafen", "Bahnhof", "Schule", "Krankenhaus", "Restaurant",
                            "Supermarkt", "Museum", "Strand", "Bibliothek", "Stadion",
                            "Kino", "Hotel", "Park", "Zoo", "Berg",
                            "Schwimmbad", "Kirche", "Universitaet", "Tankstelle", "Campingplatz"
                    ),
                    "Berufe", List.of(
                            "Arzt", "Lehrer", "Polizist", "Feuerwehrmann", "Pilot",
                            "Koch", "Journalist", "Anwalt", "Programmierer", "Architekt",
                            "Tierarzt", "Baecker", "Mechaniker", "Fotograf", "Musiker",
                            "Designer", "Maurer", "Elektriker", "Gaertner", "Zahnarzt"
                    ),
                    "Filme & Serien", List.of(
                            "Titanic", "Avatar", "Inception", "Gladiator", "Matrix",
                            "Breaking Bad", "Friends", "Sherlock", "Interstellar", "Joker",
                            "The Office", "Stranger Things", "Harry Potter", "Batman", "The Crown",
                            "Narcos", "Wednesday", "Dark", "Lost", "Squid Game"
                    ),
                    "Essen", List.of(
                            "Pizza", "Burger", "Sushi", "Doener", "Pasta",
                            "Salat", "Pommes", "Lasagne", "Pfannkuchen", "Steak",
                            "Reis", "Curry", "Sandwich", "Taco", "Waffel",
                            "Spaghetti", "Suppe", "Kebab", "Brot", "Kuchen"
                    ),
                    "Technik", List.of(
                            "Laptop", "Smartphone", "Tablet", "Kopfhörer", "Monitor",
                            "Tastatur", "Maus", "Router", "Drucker", "Kamera",
                            "Mikrofon", "Fernseher", "Konsole", "Smartwatch", "Ladekabel",
                            "USB-Stick", "Powerbank", "Lautsprecher", "Joystick", "Projektor"
                    )
            );

            defaults.forEach((name, words) -> {
                WordCategory category = categoryRepository.save(new WordCategory(name, true, null));
                List<CategoryWord> entries = words.stream()
                        .map(word -> new CategoryWord(category, word))
                        .toList();
                wordRepository.saveAll(entries);
            });
        };
    }
}
