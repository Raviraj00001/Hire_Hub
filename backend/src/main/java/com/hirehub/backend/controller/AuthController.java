package com.hirehub.backend.controller;

import com.hirehub.backend.model.AuthRequest;
import com.hirehub.backend.model.User;
import com.hirehub.backend.model.UserResponse;
import com.hirehub.backend.service.UserService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            return ResponseEntity.ok(UserResponse.fromUser(userService.register(user)));
        } catch (RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            User user = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(UserResponse.fromUser(user));
        } catch (RuntimeException exception) {
            return buildError(exception.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private ResponseEntity<Map<String, String>> buildError(String message, HttpStatus status) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}
