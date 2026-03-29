package com.spygame.model;

import java.util.ArrayList;
import java.util.List;

public class Room {
    private String id;
    private List<Player> players = new ArrayList<>();
    private List<String> spyPlayerIds = new ArrayList<>();
    private boolean started;
    private String word;
    private String hostPlayerId;
    private long startedAtEpochMillis;
    private int gameDurationMinutes = 8;
    private int imposterCount = 1;
    private Long selectedCategoryId;
    private String selectedCategoryName;

    public Room() {
    }

    public Room(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
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

    public void setSpyPlayerIds(List<String> spyPlayerIds) {
        this.spyPlayerIds = spyPlayerIds;
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

    public Long getSelectedCategoryId() {
        return selectedCategoryId;
    }

    public void setSelectedCategoryId(Long selectedCategoryId) {
        this.selectedCategoryId = selectedCategoryId;
    }

    public String getSelectedCategoryName() {
        return selectedCategoryName;
    }

    public void setSelectedCategoryName(String selectedCategoryName) {
        this.selectedCategoryName = selectedCategoryName;
    }
}
