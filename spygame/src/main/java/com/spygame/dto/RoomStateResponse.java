package com.spygame.dto;

import java.util.List;

public class RoomStateResponse {
    private final String roomId;
    private final boolean started;
    private final boolean host;
    private final String hostPlayerId;
    private final long startedAtEpochMillis;
    private final int gameDurationSeconds;
    private final List<PlayerSummary> players;

    public RoomStateResponse(
            String roomId,
            boolean started,
            boolean host,
            String hostPlayerId,
            long startedAtEpochMillis,
            int gameDurationSeconds,
            List<PlayerSummary> players
    ) {
        this.roomId = roomId;
        this.started = started;
        this.host = host;
        this.hostPlayerId = hostPlayerId;
        this.startedAtEpochMillis = startedAtEpochMillis;
        this.gameDurationSeconds = gameDurationSeconds;
        this.players = players;
    }

    public String getRoomId() {
        return roomId;
    }

    public boolean isStarted() {
        return started;
    }

    public boolean isHost() {
        return host;
    }

    public String getHostPlayerId() {
        return hostPlayerId;
    }

    public long getStartedAtEpochMillis() {
        return startedAtEpochMillis;
    }

    public int getGameDurationSeconds() {
        return gameDurationSeconds;
    }

    public List<PlayerSummary> getPlayers() {
        return players;
    }

    public static class PlayerSummary {
        private final String id;
        private final String name;
        private final boolean host;

        public PlayerSummary(String id, String name, boolean host) {
            this.id = id;
            this.name = name;
            this.host = host;
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public boolean isHost() {
            return host;
        }
    }
}
