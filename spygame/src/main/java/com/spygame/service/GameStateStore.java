package com.spygame.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spygame.model.GameState;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.function.Function;

@Service
public class GameStateStore {
    private final ObjectMapper objectMapper;
    private final Path storagePath;
    private final Object monitor = new Object();

    public GameStateStore(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.storagePath = resolveStoragePath();
    }

    public <T> T read(Function<GameState, T> reader) {
        synchronized (monitor) {
            return reader.apply(loadState());
        }
    }

    public <T> T write(Function<GameState, T> writer) {
        synchronized (monitor) {
            GameState state = loadState();
            T result = writer.apply(state);
            saveState(state);
            return result;
        }
    }

    private GameState loadState() {
        try {
            ensureParentExists();
            if (Files.notExists(storagePath)) {
                return new GameState();
            }
            return objectMapper.readValue(storagePath.toFile(), GameState.class);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not load game state", ex);
        }
    }

    private void saveState(GameState state) {
        try {
            ensureParentExists();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(storagePath.toFile(), state);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not save game state", ex);
        }
    }

    private void ensureParentExists() throws IOException {
        Path parent = storagePath.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
    }

    private Path resolveStoragePath() {
        String websiteSiteName = System.getenv("WEBSITE_SITE_NAME");
        if (websiteSiteName != null && !websiteSiteName.isBlank()) {
            return Paths.get("/home/data/spygame-state.json");
        }
        return Paths.get("data", "spygame-state.json");
    }
}
