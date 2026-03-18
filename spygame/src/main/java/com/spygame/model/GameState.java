package com.spygame.model;

import java.util.HashMap;
import java.util.Map;

public class GameState {
    private Map<String, Room> rooms = new HashMap<>();
    private Map<String, String> playerToRoom = new HashMap<>();

    public Map<String, Room> getRooms() {
        return rooms;
    }

    public void setRooms(Map<String, Room> rooms) {
        this.rooms = rooms;
    }

    public Map<String, String> getPlayerToRoom() {
        return playerToRoom;
    }

    public void setPlayerToRoom(Map<String, String> playerToRoom) {
        this.playerToRoom = playerToRoom;
    }
}
