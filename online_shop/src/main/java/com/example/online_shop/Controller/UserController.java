package com.example.online_shop.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.online_shop.Entity.User;
import com.example.online_shop.Service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:8088/admin.html")
public class UserController {

    
    UserService userSer;
    private final PasswordEncoder passwordEncoder; 
    
    
    public UserController(UserService userSer, PasswordEncoder passwordEncoder) {
        this.userSer = userSer;
        this.passwordEncoder = passwordEncoder; 
    }


    @PostMapping
    public ResponseEntity<?> newUser(@RequestBody User user) {
        try {
        	 if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                 String hashedPassword = passwordEncoder.encode(user.getPassword());
                 user.setPassword(hashedPassword);
             }
        	
            userSer.newUser(user);
            
            return ResponseEntity.ok().body("{\"message\": \"User saved successfully\", \"id\": " + user.getId() + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public List<User> getUsers() {
        return userSer.getUsers();
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userSer.getUserById(id);
    }
}