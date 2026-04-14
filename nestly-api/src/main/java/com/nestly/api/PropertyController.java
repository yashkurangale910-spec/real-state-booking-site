package com.nestly.api;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyController {

    private final PropertyRepository repository;
    private final LeadRepository leadRepository;
    private final NewsletterRepository newsletterRepository;
    private final ReviewRepository reviewRepository;

    public PropertyController(PropertyRepository repository, LeadRepository leadRepository, 
                              NewsletterRepository newsletterRepository, ReviewRepository reviewRepository) {
        this.repository = repository;
        this.leadRepository = leadRepository;
        this.newsletterRepository = newsletterRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Property> getProperties(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        
        if (search != null && !search.isEmpty()) {
            return repository.findByTitleContainingIgnoreCase(search);
        }
        if (location != null && !location.isEmpty()) {
            return repository.findByLocationContainingIgnoreCase(location);
        }
        if (type != null && !type.isEmpty()) {
            return repository.findByTypeIgnoreCase(type);
        }
        return repository.findAll();
    }

    @PostMapping("/enquire")
    public Lead enquire(@RequestBody Lead enquiry) {
        return leadRepository.save(enquiry);
    }

    @GetMapping("/admin/leads")
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    @PostMapping("/newsletter")
    public Newsletter subscribe(@RequestBody Newsletter sub) {
        return newsletterRepository.save(sub);
    }

    @PostMapping("/reviews")
    public Review addReview(@RequestBody Review review) {
        return reviewRepository.save(review);
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getPropertyReviews(@PathVariable Long id) {
        return repository.findById(id)
                .map(p -> reviewRepository.findAll()) // Simplified for now
                .orElse(List.of());
    }
}
