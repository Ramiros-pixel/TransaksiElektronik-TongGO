package com.example.TongGo.repository;

import com.example.TongGo.model.userModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<userModel, Long> {
    Optional<userModel> findByUsername(String username);
    Optional<userModel> findByEmail(String email);
    Optional<userModel> findByResetPasswordToken(String resetPasswordToken);
}
