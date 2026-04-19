package com.example.online_shop.Controller;

import com.example.online_shop.Entity.Admin;
import com.example.online_shop.Entity.User;
import com.example.online_shop.Repository.AdminRepository;
import com.example.online_shop.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final PasswordEncoder passwordEncoder;

    public LoginController(UserRepository userRepo, AdminRepository adminRepo, 
                          PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, 
                       @RequestParam String password,
                       HttpServletRequest request) {
        
        
        var adminOpt = adminRepo.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (passwordEncoder.matches(password, admin.getPassword())) {
                               HttpSession session = request.getSession();
                session.setAttribute("userType", "ADMIN");
                session.setAttribute("username", username);
                session.setAttribute("adminId", admin.getId());
                
                return "redirect:/admin.html";  
        }
        }
      
        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
              
                HttpSession session = request.getSession();
                session.setAttribute("userType", "USER");
                session.setAttribute("username", username);
                session.setAttribute("userId", user.getId());
                
                return "redirect:/shop.html";  
            }
        }
        
        
        return "redirect:/login.html?error=Invalid+username+or+password";
    }
    
    @PostMapping("/logout")
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return "redirect:/login.html";
    }
}