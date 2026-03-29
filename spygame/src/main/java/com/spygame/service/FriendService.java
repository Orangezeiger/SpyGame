package com.spygame.service;

import com.spygame.dto.FriendsOverviewResponse;
import com.spygame.dto.RespondFriendRequest;
import com.spygame.dto.SendFriendRequest;
import com.spygame.model.FriendRequest;
import com.spygame.model.FriendRequestStatus;
import com.spygame.model.Room;
import com.spygame.model.UserAccount;
import com.spygame.repository.FriendRequestRepository;
import com.spygame.repository.UserAccountRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class FriendService {
    private static final Duration ONLINE_WINDOW = Duration.ofMinutes(2);

    private final FriendRequestRepository friendRequestRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserService userService;
    private final GameStateStore gameStateStore;

    public FriendService(FriendRequestRepository friendRequestRepository,
                         UserAccountRepository userAccountRepository,
                         UserService userService,
                         GameStateStore gameStateStore) {
        this.friendRequestRepository = friendRequestRepository;
        this.userAccountRepository = userAccountRepository;
        this.userService = userService;
        this.gameStateStore = gameStateStore;
    }

    @Transactional
    public void sendRequest(SendFriendRequest request) {
        UserAccount requester = userService.requireUser(request.getRequesterUserId());
        String targetUsername = request.getTargetUsername() == null ? "" : request.getTargetUsername().trim();
        if (targetUsername.isBlank()) {
            throw new IllegalArgumentException("Bitte gib einen Benutzernamen ein");
        }
        if (requester.getUsername().equalsIgnoreCase(targetUsername)) {
            throw new IllegalArgumentException("Du kannst dich nicht selbst adden");
        }
        UserAccount target = userAccountRepository.findByUsernameIgnoreCase(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
        friendRequestRepository.findExistingRelationship(requester.getId(), target.getUsername())
                .ifPresent(existing -> {
                    if (existing.getStatus() == FriendRequestStatus.ACCEPTED) {
                        throw new IllegalArgumentException("Ihr seid bereits befreundet");
                    }
                    throw new IllegalArgumentException("Es gibt bereits eine offene Anfrage");
                });
        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(requester);
        friendRequest.setReceiver(target);
        friendRequestRepository.save(friendRequest);
    }

    @Transactional
    public void respond(RespondFriendRequest request) {
        UserAccount receiver = userService.requireUser(request.getUserId());
        FriendRequest friendRequest = friendRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Freundschaftsanfrage nicht gefunden"));
        if (!friendRequest.getReceiver().getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Diese Anfrage gehoert nicht zu dir");
        }
        if (friendRequest.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Diese Anfrage wurde bereits bearbeitet");
        }
        friendRequest.setStatus(request.isAccept() ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.DECLINED);
        friendRequestRepository.save(friendRequest);
    }

    @Transactional
    public FriendsOverviewResponse overview(Long userId) {
        userService.touchPresence(userId);
        List<FriendsOverviewResponse.FriendSummary> friends = friendRequestRepository.findAcceptedForUser(userId).stream()
                .map(friendRequest -> friendRequest.getSender().getId().equals(userId)
                        ? friendRequest.getReceiver()
                        : friendRequest.getSender())
                .map(this::toFriendSummary)
                .toList();

        List<FriendsOverviewResponse.IncomingRequest> incoming = friendRequestRepository
                .findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(request -> new FriendsOverviewResponse.IncomingRequest(
                        request.getId(),
                        request.getSender().getId(),
                        request.getSender().getUsername()
                ))
                .toList();

        boolean hasOnlineFriends = friends.stream().anyMatch(FriendsOverviewResponse.FriendSummary::isOnline);
        return new FriendsOverviewResponse(hasOnlineFriends, friends, incoming);
    }

    private FriendsOverviewResponse.FriendSummary toFriendSummary(UserAccount user) {
        boolean online = user.getLastSeenAt() != null && user.getLastSeenAt().isAfter(Instant.now().minus(ONLINE_WINDOW));
        String roomCode = user.getActiveRoomCode();
        boolean joinable = false;
        if (roomCode != null && user.isActiveRoomHost()) {
            joinable = gameStateStore.read(state -> {
                Room room = state.getRooms().get(roomCode);
                return room != null && !room.isStarted();
            });
        }
        return new FriendsOverviewResponse.FriendSummary(
                user.getId(),
                user.getUsername(),
                online,
                user.isActiveRoomHost() && roomCode != null,
                joinable,
                roomCode,
                user.isActiveRoomPasswordProtected()
        );
    }
}
