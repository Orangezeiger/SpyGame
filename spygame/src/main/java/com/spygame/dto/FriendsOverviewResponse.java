package com.spygame.dto;

import java.util.List;

public class FriendsOverviewResponse {
    private final boolean hasOnlineFriends;
    private final List<FriendSummary> friends;
    private final List<IncomingRequest> incomingRequests;

    public FriendsOverviewResponse(boolean hasOnlineFriends, List<FriendSummary> friends, List<IncomingRequest> incomingRequests) {
        this.hasOnlineFriends = hasOnlineFriends;
        this.friends = friends;
        this.incomingRequests = incomingRequests;
    }

    public boolean isHasOnlineFriends() { return hasOnlineFriends; }
    public List<FriendSummary> getFriends() { return friends; }
    public List<IncomingRequest> getIncomingRequests() { return incomingRequests; }

    public static class FriendSummary {
        private final Long userId;
        private final String username;
        private final boolean online;
        private final boolean hosting;
        private final boolean joinable;
        private final String roomCode;
        private final boolean passwordProtected;

        public FriendSummary(Long userId, String username, boolean online, boolean hosting, boolean joinable, String roomCode, boolean passwordProtected) {
            this.userId = userId;
            this.username = username;
            this.online = online;
            this.hosting = hosting;
            this.joinable = joinable;
            this.roomCode = roomCode;
            this.passwordProtected = passwordProtected;
        }

        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public boolean isOnline() { return online; }
        public boolean isHosting() { return hosting; }
        public boolean isJoinable() { return joinable; }
        public String getRoomCode() { return roomCode; }
        public boolean isPasswordProtected() { return passwordProtected; }
    }

    public static class IncomingRequest {
        private final Long requestId;
        private final Long userId;
        private final String username;

        public IncomingRequest(Long requestId, Long userId, String username) {
            this.requestId = requestId;
            this.userId = userId;
            this.username = username;
        }

        public Long getRequestId() { return requestId; }
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
    }
}
