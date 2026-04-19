package com.example.online_shop.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.online_shop.Entity.User;
import com.example.online_shop.Repository.UserRepository;


@Service

public class UserService {

	
	@Autowired
	UserRepository userRepo;
	
	private final PasswordEncoder passwordEncoder;
	
    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder, PasswordEncoder passwordEncoder2) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }
   
	
    public void newUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
    }
	
	public List<User> getUsers(){
		return userRepo.findAll();
	}
	
	public Optional<User> getUserById(Long id ){
		return userRepo.findById(id);
		
		
	}
	
	
	
	
	
	
	
}
