package com.spygame.controller;

import com.spygame.dto.FriendsOverviewResponse;
import com.spygame.dto.RespondFriendRequest;
import com.spygame.dto.SendFriendRequest;
import com.spygame.service.FriendService;
import com.spygame.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class FriendController {
    private final FriendService friendService;
    private final UserService userService;

    public FriendController(FriendService friendService, UserService userService) {
        this.friendService = friendService;
        this.userService = userService;
    }

    @GetMapping("/friends")
    public FriendsOverviewResponse overview(@RequestParam Long userId) {
        return friendService.overview(userId);
    }

    @PostMapping("/friends/request")
    public Map<String, String> send(@RequestBody SendFriendRequest request) {
        friendService.sendRequest(request);
        return Map.of("status", "ok");
    }

    @PostMapping("/friends/respond")
    public Map<String, String> respond(@RequestBody RespondFriendRequest request) {
        friendService.respond(request);
        return Map.of("status", "ok");
    }

    @PostMapping("/presence/ping")
    public Map<String, String> ping(@RequestParam Long userId) {
        userService.touchPresence(userId);
        return Map.of("status", "ok");
    }
}
