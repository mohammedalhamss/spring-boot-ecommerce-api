package com.example.online_shop.Service;


import com.example.online_shop.Entity.Admin;
import com.example.online_shop.Entity.User;
import com.example.online_shop.Repository.AdminRepository;
import com.example.online_shop.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DataInitializer {
    
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    
  
    public DataInitializer(UserRepository userRepository, 
                          AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @PostConstruct
    public void init() {
        
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); 
            
            adminRepository.save(admin);
            System.out.println("Created default admin: admin/admin123");
        }
        
        
        if (userRepository.count() == 0) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123")); 
            user.setEmail("user@shop.com");
            userRepository.save(user);
            System.out.println("Created default user: user/user123");
        }
    }
}