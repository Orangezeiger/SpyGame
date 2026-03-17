package com.spygame.model;

import java.util.ArrayList;
import java.util.List;

public class Room {
    private final String id;
    private final List<Player> players = new ArrayList<>();
    private final List<String> spyPlayerIds = new ArrayList<>();
    private boolean started;
    private String word;
    private String hostPlayerId;
    private long startedAtEpochMillis;
    private int gameDurationMinutes = 8;
    private int imposterCount = 1;

    public Room(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public List<String> getSpyPlayerIds() {
        return spyPlayerIds;
    }

    public String getHostPlayerId() {
        return hostPlayerId;
    }

    public void setHostPlayerId(String hostPlayerId) {
        this.hostPlayerId = hostPlayerId;
    }

    public long getStartedAtEpochMillis() {
        return startedAtEpochMillis;
    }

    public void setStartedAtEpochMillis(long startedAtEpochMillis) {
        this.startedAtEpochMillis = startedAtEpochMillis;
    }

    public int getGameDurationMinutes() {
        return gameDurationMinutes;
    }

    public void setGameDurationMinutes(int gameDurationMinutes) {
        this.gameDurationMinutes = gameDurationMinutes;
    }

    public int getImposterCount() {
        return imposterCount;
    }

    public void setImposterCount(int imposterCount) {
        this.imposterCount = imposterCount;
    }
}
