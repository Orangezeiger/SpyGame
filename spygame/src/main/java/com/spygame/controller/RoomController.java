package com.spygame.controller;

import com.spygame.dto.CreateRoomRequest;
import com.spygame.dto.CreateRoomResponse;
import com.spygame.dto.JoinRoomRequest;
import com.spygame.dto.JoinRoomResponse;
import com.spygame.dto.RoleResponse;
import com.spygame.dto.RoomStateResponse;
import com.spygame.dto.StartGameRequest;
import com.spygame.dto.StartGameResponse;
import com.spygame.dto.UpdateRoomSettingsRequest;
import com.spygame.service.RoomService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/create-room")
    public CreateRoomResponse createRoom(@RequestBody CreateRoomRequest request) {
        return roomService.createRoom(request.getPlayerName());
    }

    @PostMapping("/join-room")
    public JoinRoomResponse joinRoom(@RequestBody JoinRoomRequest request) {
        return roomService.joinRoom(request.getRoomId(), request.getPlayerName());
    }

    @PostMapping("/start-game")
    public StartGameResponse startGame(@RequestBody StartGameRequest request) {
        return roomService.startGame(request.getRoomId(), request.getPlayerId());
    }

    @GetMapping("/role")
    public RoleResponse role(@RequestParam String playerId) {
        return roomService.getRole(playerId);
    }

    @GetMapping("/room-state")
    public RoomStateResponse roomState(@RequestParam String roomId, @RequestParam(required = false) String playerId) {
        return roomService.getRoomState(roomId, playerId);
    }

    @PostMapping("/room-settings")
    public RoomStateResponse updateRoomSettings(@RequestBody UpdateRoomSettingsRequest request) {
        return roomService.updateRoomSettings(
                request.getRoomId(),
                request.getPlayerId(),
                request.getGameDurationMinutes(),
                request.getImposterCount(),
                request.getCategoryId()
        );
    }

    @PostMapping("/leave-room")
    public Map<String, String> leaveRoom(@RequestParam String playerId) {
        roomService.leaveRoom(playerId);
        return Map.of("status", "ok");
    }
}
