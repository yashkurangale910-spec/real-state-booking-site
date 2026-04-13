package com.nestly.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class NestlyApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(NestlyApiApplication.class, args);
	}

	@Bean
	CommandLineRunner runner(PropertyRepository repository) {
		return args -> {
			repository.save(new Property(null, "The Obsidian Horizon", "Santorini, Greece", "€34.5M", "Villa", "/nestly_hero_architecture_1776064100314.png", "A poetic dialogue between monolithic concrete and the fluid vastness of the Aegean coast."));
			repository.save(new Property(null, "Celestial Meadows", "Mumbai, India", "₹45 Cr", "Residential", "/nestly_curated_complexity_1776064134813.png", "A high-end residential complex designed for the elite."));
			repository.save(new Property(null, "The Copper Ridge", "Arizona, USA", "$12.5M", "Estate", "/nestly_structural_mimicry_1776064153745.png", "Integration of modern architecture with the rugged desert landscape."));
		};
	}
}
