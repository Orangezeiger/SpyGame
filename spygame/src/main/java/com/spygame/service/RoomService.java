package com.spygame.service;

import com.spygame.dto.CreateRoomResponse;
import com.spygame.dto.JoinRoomResponse;
import com.spygame.dto.RoleResponse;
import com.spygame.dto.RoomStateResponse;
import com.spygame.dto.StartGameResponse;
import com.spygame.model.Player;
import com.spygame.model.Room;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
    private static final int GAME_DURATION_SECONDS = 8 * 60;

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> playerToRoom = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    private final List<String> words = Arrays.asList(
            "Flughafen",
            "Strand",
            "Krankenhaus",
            "Schule",
            "Supermarkt",
            "Berg",
            "Stadion",
            "Museum",
            "Bibliothek",
            "Restaurant"
    );

    public CreateRoomResponse createRoom(String playerName) {
        String roomId = numericRoomId();
        Room room = new Room(roomId);
        rooms.put(roomId, room);
        String playerId = addPlayer(room, playerName);
        room.setHostPlayerId(playerId);
        return new CreateRoomResponse(roomId, playerId);
    }

    public JoinRoomResponse joinRoom(String roomId, String playerName) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        if (room.isStarted()) {
            throw new IllegalArgumentException("Game already started");
        }
        String playerId = addPlayer(room, playerName);
        return new JoinRoomResponse(roomId, playerId);
    }

    public StartGameResponse startGame(String roomId, String playerId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        synchronized (room) {
            if (!playerId.equals(room.getHostPlayerId())) {
                throw new IllegalArgumentException("Only the host can start the game");
            }
            if (!room.isStarted()) {
                if (room.getPlayers().size() < 2) {
                    throw new IllegalArgumentException("Need at least 2 players");
                }
                String word = words.get(random.nextInt(words.size()));
                int spyIndex = random.nextInt(room.getPlayers().size());
                String spyPlayerId = room.getPlayers().get(spyIndex).getId();
                room.setWord(word);
                room.setSpyPlayerId(spyPlayerId);
                room.setStartedAtEpochMillis(System.currentTimeMillis());
                room.setStarted(true);
            }
        }
        return new StartGameResponse(roomId, room.getPlayers().size());
    }

    public RoleResponse getRole(String playerId) {
        String roomId = playerToRoom.get(playerId);
        if (roomId == null) {
            throw new IllegalArgumentException("Player not found");
        }
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        if (!room.isStarted()) {
            throw new IllegalArgumentException("Game not started");
        }
        if (playerId.equals(room.getSpyPlayerId())) {
            return new RoleResponse("SPY", null);
        }
        return new RoleResponse("PLAYER", room.getWord());
    }

    public RoomStateResponse getRoomState(String roomId, String playerId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        List<RoomStateResponse.PlayerSummary> players = room.getPlayers().stream()
                .map(player -> new RoomStateResponse.PlayerSummary(
                        player.getId(),
                        player.getName(),
                        player.getId().equals(room.getHostPlayerId())
                ))
                .toList();
        return new RoomStateResponse(
                roomId,
                room.isStarted(),
                playerId != null && playerId.equals(room.getHostPlayerId()),
                room.getHostPlayerId(),
                room.getStartedAtEpochMillis(),
                GAME_DURATION_SECONDS,
                players
        );
    }

    public void leaveRoom(String playerId) {
        String roomId = playerToRoom.remove(playerId);
        if (roomId == null) {
            return;
        }
        Room room = rooms.get(roomId);
        if (room == null) {
            return;
        }

        synchronized (room) {
            room.getPlayers().removeIf(player -> player.getId().equals(playerId));

            if (room.getPlayers().isEmpty()) {
                rooms.remove(roomId);
                return;
            }

            if (playerId.equals(room.getHostPlayerId())) {
                room.setHostPlayerId(room.getPlayers().get(0).getId());
            }
        }
    }

    private String addPlayer(Room room, String playerName) {
        if (playerName == null || playerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name required");
        }
        String playerId = shortId();
        Player player = new Player(playerId, playerName.trim());
        synchronized (room) {
            room.getPlayers().add(player);
        }
        playerToRoom.put(playerId, room.getId());
        return playerId;
    }

    private String numericRoomId() {
        String roomId;
        do {
            roomId = String.format("%06d", random.nextInt(1_000_000));
        } while (rooms.containsKey(roomId));
        return roomId;
    }

    private String shortId() {
        return String.format("%08d", random.nextInt(100_000_000));
    }
}
