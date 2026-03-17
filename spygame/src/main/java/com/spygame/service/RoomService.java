package com.spygame.service;

import com.spygame.dto.CreateRoomResponse;
import com.spygame.dto.JoinRoomResponse;
import com.spygame.dto.RoleResponse;
import com.spygame.dto.StartGameResponse;
import com.spygame.model.Player;
import com.spygame.model.Room;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
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
        String roomId = shortId();
        Room room = new Room(roomId);
        rooms.put(roomId, room);
        String playerId = addPlayer(room, playerName);
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
        return new JoinRoomResponse(playerId);
    }

    public StartGameResponse startGame(String roomId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        synchronized (room) {
            if (!room.isStarted()) {
                if (room.getPlayers().size() < 2) {
                    throw new IllegalArgumentException("Need at least 2 players");
                }
                String word = words.get(random.nextInt(words.size()));
                int spyIndex = random.nextInt(room.getPlayers().size());
                String spyPlayerId = room.getPlayers().get(spyIndex).getId();
                room.setWord(word);
                room.setSpyPlayerId(spyPlayerId);
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

    private String shortId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
