package com.spygame.dto;

public class RespondFriendRequest {
    private Long userId;
    private Long requestId;
    private boolean accept;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public boolean isAccept() { return accept; }
    public void setAccept(boolean accept) { this.accept = accept; }
}
