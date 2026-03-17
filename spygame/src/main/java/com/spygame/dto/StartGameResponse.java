package com.spygame.dto;

public class StartGameResponse {
    private final String roomId;
    private final int playerCount;

    public StartGameResponse(String roomId, int playerCount) {
        this.roomId = roomId;
        this.playerCount = playerCount;
    }

    public String getRoomId() {
        return roomId;
    }

    public int getPlayerCount() {
        return playerCount;
    }
}
