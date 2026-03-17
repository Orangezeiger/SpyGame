package com.spygame.dto;

public class JoinRoomResponse {
    private final String roomId;
    private final String playerId;

    public JoinRoomResponse(String roomId, String playerId) {
        this.roomId = roomId;
        this.playerId = playerId;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getPlayerId() {
        return playerId;
    }
}
