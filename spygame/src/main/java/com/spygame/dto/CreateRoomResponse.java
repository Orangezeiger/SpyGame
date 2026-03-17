package com.spygame.dto;

public class CreateRoomResponse {
    private final String roomId;
    private final String playerId;

    public CreateRoomResponse(String roomId, String playerId) {
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
