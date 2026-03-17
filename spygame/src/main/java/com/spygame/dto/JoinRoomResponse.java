package com.spygame.dto;

public class JoinRoomResponse {
    private final String playerId;

    public JoinRoomResponse(String playerId) {
        this.playerId = playerId;
    }

    public String getPlayerId() {
        return playerId;
    }
}
