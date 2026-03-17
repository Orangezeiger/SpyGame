package com.spygame.model;

import java.util.ArrayList;
import java.util.List;

public class Room {
    private final String id;
    private final List<Player> players = new ArrayList<>();
    private boolean started;
    private String word;
    private String spyPlayerId;

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

    public String getSpyPlayerId() {
        return spyPlayerId;
    }

    public void setSpyPlayerId(String spyPlayerId) {
        this.spyPlayerId = spyPlayerId;
    }
}
