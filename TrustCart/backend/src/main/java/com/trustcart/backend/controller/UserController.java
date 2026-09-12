package com.trustcart.backend.controller;

import com.trustcart.backend.dto.LoginRequestDTO;
import com.trustcart.backend.dto.LoginResponseDTO;
import com.trustcart.backend.dto.UserRequestDTO;
import com.trustcart.backend.dto.UserResponseDTO;
import com.trustcart.backend.model.User;
import com.trustcart.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register a new customer user (public)
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerUser(
            @RequestBody UserRequestDTO request) {

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                "CUSTOMER"
        );

        User savedUser = userService.registerUser(user);

        UserResponseDTO response = new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Login (public)
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO request) {

        LoginResponseDTO response = userService.login(request);

        return ResponseEntity.ok(response);
    }

    // Get all users - ADMIN only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {

        List<UserResponseDTO> users = userService.getAllUsers()
                .stream()
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }

    // Get user by email - Only current user or ADMIN
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(
            @PathVariable String email,
            Authentication authentication) {

        if (authentication == null ||
                (!authentication.getName().equals(email) &&
                 authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return userService.getUserByEmail(email)
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}