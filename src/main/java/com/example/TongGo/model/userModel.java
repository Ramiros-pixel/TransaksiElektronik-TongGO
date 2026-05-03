package com.example.TongGo.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Data;

@Entity
@Table(name= "users")
@Data

public class userModel {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "username", nullable = false)
private String username;

@Column(name = "email", nullable = false)
private String email;

@Column(name = "password", nullable= false)
private String password;

@Enumerated(EnumType.STRING)
@Column(name = "role", nullable = false)
private Role role;

}
