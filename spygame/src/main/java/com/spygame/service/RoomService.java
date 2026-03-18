package com.spygame.service;

import com.spygame.dto.CreateRoomResponse;
import com.spygame.dto.JoinRoomResponse;
import com.spygame.dto.RoleResponse;
import com.spygame.dto.RoomStateResponse;
import com.spygame.dto.StartGameResponse;
import com.spygame.model.GameState;
import com.spygame.model.Player;
import com.spygame.model.Room;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class RoomService {
    private static final int MIN_PLAYERS_TO_START = 3;
    private static final int MIN_GAME_DURATION_MINUTES = 3;
    private static final int MAX_GAME_DURATION_MINUTES = 15;

    private final GameStateStore gameStateStore;
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

    public RoomService(GameStateStore gameStateStore) {
        this.gameStateStore = gameStateStore;
    }

    public CreateRoomResponse createRoom(String playerName) {
        return gameStateStore.write(state -> {
            String roomId = numericRoomId(state);
            Room room = new Room(roomId);
            state.getRooms().put(roomId, room);
            String playerId = addPlayer(state, room, playerName);
            room.setHostPlayerId(playerId);
            return new CreateRoomResponse(roomId, playerId);
        });
    }

    public JoinRoomResponse joinRoom(String roomId, String playerName) {
        return gameStateStore.write(state -> {
            Room room = requireRoom(state, roomId);
            if (room.isStarted()) {
                throw new IllegalArgumentException("Game already started");
            }
            String playerId = addPlayer(state, room, playerName);
            return new JoinRoomResponse(roomId, playerId);
        });
    }

    public StartGameResponse startGame(String roomId, String playerId) {
        return gameStateStore.write(state -> {
            Room room = requireRoom(state, roomId);
            if (!playerId.equals(room.getHostPlayerId())) {
                throw new IllegalArgumentException("Only the host can start the game");
            }
            if (!room.isStarted()) {
                int playerCount = room.getPlayers().size();
                if (playerCount < MIN_PLAYERS_TO_START) {
                    throw new IllegalArgumentException("Need at least 3 players");
                }
                validateImposterCount(playerCount, room.getImposterCount());
                String word = words.get(random.nextInt(words.size()));
                room.getSpyPlayerIds().clear();
                List<Player> shuffledPlayers = new java.util.ArrayList<>(room.getPlayers());
                java.util.Collections.shuffle(shuffledPlayers, random);
                for (int index = 0; index < room.getImposterCount(); index++) {
                    room.getSpyPlayerIds().add(shuffledPlayers.get(index).getId());
                }
                room.setWord(word);
                room.setStartedAtEpochMillis(System.currentTimeMillis());
                room.setStarted(true);
            }
            return new StartGameResponse(roomId, room.getPlayers().size());
        });
    }

    public RoleResponse getRole(String playerId) {
        return gameStateStore.read(state -> {
            Room room = findRoomByPlayerId(state, playerId);
            if (!room.isStarted()) {
                throw new IllegalArgumentException("Game not started");
            }
            if (room.getSpyPlayerIds().contains(playerId)) {
                return new RoleResponse("SPY", null);
            }
            return new RoleResponse("PLAYER", room.getWord());
        });
    }

    public RoomStateResponse getRoomState(String roomId, String playerId) {
        return gameStateStore.read(state -> toRoomStateResponse(requireRoom(state, roomId), playerId));
    }

    public RoomStateResponse updateRoomSettings(String roomId, String playerId, Integer gameDurationMinutes, Integer imposterCount) {
        return gameStateStore.write(state -> {
            Room room = requireRoom(state, roomId);
            if (!playerId.equals(room.getHostPlayerId())) {
                throw new IllegalArgumentException("Only the host can change settings");
            }
            if (room.isStarted()) {
                throw new IllegalArgumentException("Game already started");
            }
            if (gameDurationMinutes != null) {
                if (gameDurationMinutes < MIN_GAME_DURATION_MINUTES || gameDurationMinutes > MAX_GAME_DURATION_MINUTES) {
                    throw new IllegalArgumentException("Minutes must be between 3 and 15");
                }
                room.setGameDurationMinutes(gameDurationMinutes);
            }
            if (imposterCount != null) {
                validateImposterCount(room.getPlayers().size(), imposterCount);
                room.setImposterCount(imposterCount);
            }
            return toRoomStateResponse(room, playerId);
        });
    }

    public void leaveRoom(String playerId) {
        gameStateStore.write(state -> {
            String roomId = state.getPlayerToRoom().remove(playerId);
            if (roomId == null) {
                return null;
            }
            Room room = state.getRooms().get(roomId);
            if (room == null) {
                return null;
            }
            room.getPlayers().removeIf(player -> player.getId().equals(playerId));
            room.getSpyPlayerIds().removeIf(spyId -> spyId.equals(playerId));

            if (room.getPlayers().isEmpty()) {
                state.getRooms().remove(roomId);
                return null;
            }

            if (playerId.equals(room.getHostPlayerId())) {
                room.setHostPlayerId(room.getPlayers().get(0).getId());
            }

            room.setImposterCount(Math.min(room.getImposterCount(), maxImposterCount(room.getPlayers().size())));
            return null;
        });
    }

    private String addPlayer(GameState state, Room room, String playerName) {
        if (playerName == null || playerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name required");
        }
        String playerId = shortId();
        Player player = new Player(playerId, playerName.trim());
        room.getPlayers().add(player);
        state.getPlayerToRoom().put(playerId, room.getId());
        return playerId;
    }

    private String numericRoomId(GameState state) {
        String roomId;
        do {
            roomId = String.format("%06d", random.nextInt(1_000_000));
        } while (state.getRooms().containsKey(roomId));
        return roomId;
    }

    private String shortId() {
        return String.format("%08d", random.nextInt(100_000_000));
    }

    private int maxImposterCount(int playerCount) {
        if (playerCount >= 7) {
            return 3;
        }
        if (playerCount >= 5) {
            return 2;
        }
        return 1;
    }

    private void validateImposterCount(int playerCount, int imposterCount) {
        if (imposterCount < 1 || imposterCount > 3) {
            throw new IllegalArgumentException("Imposters must be between 1 and 3");
        }
        int maxImposters = maxImposterCount(playerCount);
        if (imposterCount > maxImposters) {
            throw new IllegalArgumentException("Too many imposters for current player count");
        }
    }

    private Room requireRoom(GameState state, String roomId) {
        Room room = state.getRooms().get(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        return room;
    }

    private Room findRoomByPlayerId(GameState state, String playerId) {
        String roomId = state.getPlayerToRoom().get(playerId);
        if (roomId == null) {
            throw new IllegalArgumentException("Player not found");
        }
        return requireRoom(state, roomId);
    }

    private RoomStateResponse toRoomStateResponse(Room room, String playerId) {
        List<RoomStateResponse.PlayerSummary> players = room.getPlayers().stream()
                .map(player -> new RoomStateResponse.PlayerSummary(
                        player.getId(),
                        player.getName(),
                        player.getId().equals(room.getHostPlayerId())
                ))
                .toList();
        int maxImposters = maxImposterCount(room.getPlayers().size());
        int effectiveImposterCount = Math.min(room.getImposterCount(), maxImposters);
        return new RoomStateResponse(
                room.getId(),
                room.isStarted(),
                playerId != null && playerId.equals(room.getHostPlayerId()),
                room.getHostPlayerId(),
                room.getStartedAtEpochMillis(),
                room.getGameDurationMinutes() * 60,
                room.getGameDurationMinutes(),
                effectiveImposterCount,
                maxImposters,
                MIN_PLAYERS_TO_START,
                players
        );
    }
}
