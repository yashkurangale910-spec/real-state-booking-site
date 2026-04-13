package com.nestly.api;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyController {

    private final PropertyRepository repository;

    public PropertyController(PropertyRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Property> getProperties(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return repository.findByTitleContainingIgnoreCase(search);
        }
        return repository.findAll();
    }

    @PostMapping("/enquire")
    public String enquire(@RequestBody Object enquiry) {
        System.out.println("Enquiry received: " + enquiry);
        return "SUCCESS";
    }
}
