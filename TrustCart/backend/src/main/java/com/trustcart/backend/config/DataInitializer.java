package com.trustcart.backend.config;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;
import com.trustcart.backend.service.BlockchainService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final BlockchainService blockchainService;

    public DataInitializer(
            UserRepository userRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder,
            BlockchainService blockchainService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
        this.blockchainService = blockchainService;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedProducts();
    }

    private void seedAdminUser() {
        if (userRepository.findByEmail("admin@trustcart.com").isEmpty()) {
            User admin = new User(
                    "TrustCart Administrator",
                    "admin@trustcart.com",
                    passwordEncoder.encode("Admin@123"),
                    "ADMIN"
            );
            userRepository.save(admin);
            System.out.println(">>> Seeded default ADMIN user: admin@trustcart.com (Password: Admin@123)");
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            List<Product> defaultProducts = List.of(
                    new Product(
                            "iPhone 15 Pro Max",
                            "Titanium chassis with A17 Pro chip, 48MP camera system with 5x optical zoom, and Super Retina XDR.",
                            134999.0,
                            15,
                            "Mobiles",
                            blockchainService.generateHash("PROD-IPHONE-15-PRO-MAX-" + UUID.randomUUID())
                    ),
                    new Product(
                            "MacBook Pro 16\" M3 Max",
                            "Engineered for demanding workflows with 36GB unified memory, Liquid Retina XDR display, and all-day battery.",
                            249990.0,
                            8,
                            "Electronics",
                            blockchainService.generateHash("PROD-MACBOOK-PRO-M3-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Sony WH-1000XM5 ANC",
                            "Industry-leading noise canceling headphones with dual processors, 8 microphones, and LDAC high-res audio.",
                            29990.0,
                            25,
                            "Audio",
                            blockchainService.generateHash("PROD-SONY-WH1000XM5-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Rolex Submariner Date",
                            "Oystersteel luxury diving timepiece with black Cerachrom bezel and luminescent Chromalight display.",
                            940000.0,
                            3,
                            "Watches",
                            blockchainService.generateHash("PROD-ROLEX-SUBMARINER-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Nike Air Jordan 1 Retro High",
                            "Iconic high-top basketball sneaker featuring premium leather, encapsulated Air-Sole unit, and signature styling.",
                            16995.0,
                            18,
                            "Fashion",
                            blockchainService.generateHash("PROD-JORDAN-1-RETRO-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Samsung Galaxy S24 Ultra",
                            "AI-powered flagship smartphone with embedded S Pen, 200MP camera, and titanium durability.",
                            129999.0,
                            12,
                            "Mobiles",
                            blockchainService.generateHash("PROD-GALAXY-S24-ULTRA-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Apple Watch Ultra 2",
                            "Rugged 49mm titanium case, precision dual-frequency GPS, and up to 72 hours of battery in Low Power Mode.",
                            89900.0,
                            10,
                            "Watches",
                            blockchainService.generateHash("PROD-APPLE-WATCH-ULTRA2-" + UUID.randomUUID())
                    ),
                    new Product(
                            "Bose QuietComfort Ultra",
                            "Breakthrough spatial audio, world-class active noise cancellation, and customTune sound calibration.",
                            35900.0,
                            20,
                            "Audio",
                            blockchainService.generateHash("PROD-BOSE-QC-ULTRA-" + UUID.randomUUID())
                    )
            );

            productRepository.saveAll(defaultProducts);
            System.out.println(">>> Seeded " + defaultProducts.size() + " cryptographically registered products.");
        }
    }
}
