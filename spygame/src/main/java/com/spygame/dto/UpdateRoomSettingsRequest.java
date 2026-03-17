package com.spygame.dto;

public class UpdateRoomSettingsRequest {
    private String roomId;
    private String playerId;
    private Integer gameDurationMinutes;
    private Integer imposterCount;

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public Integer getGameDurationMinutes() {
        return gameDurationMinutes;
    }

    public void setGameDurationMinutes(Integer gameDurationMinutes) {
        this.gameDurationMinutes = gameDurationMinutes;
    }

    public Integer getImposterCount() {
        return imposterCount;
    }

    public void setImposterCount(Integer imposterCount) {
        this.imposterCount = imposterCount;
    }
}
