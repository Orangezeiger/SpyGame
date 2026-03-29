package com.spygame.model;

public class Player {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private Long userId;
    private long lastSeenAtEpochMillis = System.currentTimeMillis();

    public Player() {
    }

    public Player(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public Player(String id, String name, Long userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public long getLastSeenAtEpochMillis() {
        return lastSeenAtEpochMillis;
    }

    public void setLastSeenAtEpochMillis(long lastSeenAtEpochMillis) {
        this.lastSeenAtEpochMillis = lastSeenAtEpochMillis;
    }
}
