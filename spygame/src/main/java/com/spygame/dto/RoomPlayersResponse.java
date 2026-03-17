package com.spygame.dto;

import java.util.List;

public class RoomPlayersResponse {
    private final String roomId;
    private final List<PlayerInfo> players;

    public RoomPlayersResponse(String roomId, List<PlayerInfo> players) {
        this.roomId = roomId;
        this.players = players;
    }

    public String getRoomId() {
        return roomId;
    }

    public List<PlayerInfo> getPlayers() {
        return players;
    }

    public static class PlayerInfo {
        private final String id;
        private final String name;

        public PlayerInfo(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }
}
