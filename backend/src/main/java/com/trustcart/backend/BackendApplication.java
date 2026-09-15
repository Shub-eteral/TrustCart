package com.trustcart.backend;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.repository.ProductRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.util.List;
import java.util.UUID;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner seedCatalog(ProductRepository productRepository) {
		return args -> {
			List<Product> additions = List.of(
				product("Google Pixel 9 Pro", "Advanced Tensor G4 smartphone with a polished aluminum frame, triple-camera system, and all-day battery.", 109999, 11, "Mobiles", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=88"),
				product("Dell XPS 14", "Precision laptop with an OLED display, Intel Core Ultra performance, and a refined carbon-fiber palm rest.", 154990, 7, "Electronics", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=88"),
				product("Marshall Monitor III", "Premium wireless over-ear headphones with rich tonal detail, adaptive noise cancellation, and extended battery life.", 29999, 16, "Audio", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=88"),
				product("Seiko Prospex Diver", "Automatic stainless-steel dive watch with a luminous dial, durable bezel, and 200-meter water resistance.", 48900, 5, "Watches", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=88"),
				product("New Balance 990v6", "Made-in-USA running silhouette with premium suede, responsive cushioning, and an understated everyday profile.", 21999, 14, "Fashion", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=88"),
				product("Herman Miller Desk Lamp", "Balanced task lighting with a weighted base, adjustable arm, and warm dimmable illumination for focused work.", 18900, 9, "Home", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=88"),
				product("Le Labo Santal 33", "A woody fragrance built around sandalwood, cedar, cardamom, and a subtle leather accord.", 24500, 12, "Beauty", "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=88"),
				product("Kindle Paperwhite", "Glare-free high-resolution display, adjustable warm light, and weeks of battery for distraction-free reading.", 14999, 21, "Electronics", "https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=900&q=88")
			);

			additions.stream()
				.filter(product -> !productRepository.existsByName(product.getName()))
				.forEach(productRepository::save);

			productRepository.findAll().stream()
				.filter(product -> product.getImageUrl() == null || product.getImageUrl().isBlank())
				.forEach(product -> {
					String imageUrl = defaultImageFor(product.getName());
					if (imageUrl != null) {
						product.setImageUrl(imageUrl);
						productRepository.save(product);
					}
				});
		};
	}

	private String defaultImageFor(String name) {
		String productName = name == null ? "" : name.toLowerCase();
		if (productName.contains("iphone")) return "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("galaxy")) return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("macbook")) return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("sony")) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("bose")) return "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("rolex") || productName.contains("watch")) return "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=88";
		if (productName.contains("jordan")) return "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=88";
		return null;
	}

	private Product product(String name, String description, double price, int stock,
			String category, String imageUrl) {
		Product product = new Product(name, description, price, stock, category, UUID.randomUUID().toString());
		product.setImageUrl(imageUrl);
		return product;
	}

}
