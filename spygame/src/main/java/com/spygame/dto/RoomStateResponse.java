package com.spygame.dto;

import java.util.List;

public class RoomStateResponse {
    private final String roomId;
    private final boolean started;
    private final boolean host;
    private final String hostPlayerId;
    private final long startedAtEpochMillis;
    private final int gameDurationSeconds;
    private final int gameDurationMinutes;
    private final int imposterCount;
    private final int maxImposterCount;
    private final int minPlayersToStart;
    private final Long selectedCategoryId;
    private final String selectedCategoryName;
    private final boolean passwordProtected;
    private final List<PlayerSummary> players;

    public RoomStateResponse(
            String roomId,
            boolean started,
            boolean host,
            String hostPlayerId,
            long startedAtEpochMillis,
            int gameDurationSeconds,
            int gameDurationMinutes,
            int imposterCount,
            int maxImposterCount,
            int minPlayersToStart,
            Long selectedCategoryId,
            String selectedCategoryName,
            boolean passwordProtected,
            List<PlayerSummary> players
    ) {
        this.roomId = roomId;
        this.started = started;
        this.host = host;
        this.hostPlayerId = hostPlayerId;
        this.startedAtEpochMillis = startedAtEpochMillis;
        this.gameDurationSeconds = gameDurationSeconds;
        this.gameDurationMinutes = gameDurationMinutes;
        this.imposterCount = imposterCount;
        this.maxImposterCount = maxImposterCount;
        this.minPlayersToStart = minPlayersToStart;
        this.selectedCategoryId = selectedCategoryId;
        this.selectedCategoryName = selectedCategoryName;
        this.passwordProtected = passwordProtected;
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

    public int getGameDurationMinutes() {
        return gameDurationMinutes;
    }

    public int getImposterCount() {
        return imposterCount;
    }

    public int getMaxImposterCount() {
        return maxImposterCount;
    }

    public int getMinPlayersToStart() {
        return minPlayersToStart;
    }

    public Long getSelectedCategoryId() {
        return selectedCategoryId;
    }

    public String getSelectedCategoryName() {
        return selectedCategoryName;
    }

    public boolean isPasswordProtected() {
        return passwordProtected;
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
