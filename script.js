// DOM Elements
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const testimonialSlider = document.getElementById('testimonialSlider');
const prevTestimonialBtn = document.getElementById('prevTestimonial');
const nextTestimonialBtn = document.getElementById('nextTestimonial');
const carGrid = document.querySelector('.car-grid');
const searchForm = document.querySelector('.search-form');
const pickupStateSelect = document.getElementById('pickup-state');
const pickupCitySelect = document.getElementById('pickup-city');
const pickupAddressInput = document.getElementById('pickup-address');
const pickupDateInput = document.getElementById('pickup-date');
const returnDateInput = document.getElementById('return-date');
const carTypeSelect = document.getElementById('car-type');
const tripTypeSelect = document.getElementById('trip-type');
const currentLocationBtn = document.getElementById('current-location-btn');
const heroSection = document.querySelector('.hero');
const featuredSection = document.querySelector('.featured-cars');
const whyChooseUsSection = document.querySelector('.why-choose-us');
const testimonialsSection = document.querySelector('.testimonials');
const ctaSection = document.querySelector('.cta');

// Global variables
let carsData = [];
let filteredCars = [];
let locationsData = [];
let userLocation = {
    state: '',
    city: '',
    address: ''
};
let particles = [];
let darkThemeActive = true; // Set to true since we're using dark theme

// State and City Mapping for India
const stateToCity = {
    'Maharashtra': ['Mumbai', 'Pune'],
    'Karnataka': ['Bangalore'],
    'Telangana': ['Hyderabad'],
    'Tamil Nadu': ['Chennai'],
    'Delhi': ['Delhi NCR'],
    'West Bengal': ['Kolkata'],
    'Gujarat': ['Ahmedabad'],
    'Rajasthan': ['Jaipur'],
    'Madhya Pradesh': ['Indore']
};

// Reverse mapping - city to state
const cityToState = {};
for (const state in stateToCity) {
    stateToCity[state].forEach(city => {
        cityToState[city] = state;
    });
}

// Mobile Navigation Toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Change hamburger to X
    const spans = navToggle.querySelectorAll('span');
    spans.forEach(span => span.classList.toggle('active'));
});

// Close mobile menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
            
            // Reset hamburger icon
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.remove('active'));
        }
    });
});

// Fetch car data from JSON file
const fetchCarsData = async () => {
    try {
        const response = await fetch('data/cars.json');
        const data = await response.json();
        carsData = data.cars;
        filteredCars = [...carsData];
        locationsData = data.locations;
        
        // Initialize dropdown options
        initializeLocationOptions();
        
        // Display initial cars
        displayCars(filteredCars);
        
        // Set up state change event
        setupStateChangeEvent();
        
        // Try to get user's location
        if (navigator.geolocation) {
            getCurrentLocation();
        }
    } catch (error) {
        console.error('Error fetching car data:', error);
        // If fetch fails, use hardcoded data (already on page)
    }
};

// Setup state change event to update cities dropdown
const setupStateChangeEvent = () => {
    if (pickupStateSelect) {
        pickupStateSelect.addEventListener('change', () => {
            updateCityOptions(pickupStateSelect.value);
        });
    }
};

// Update city options based on selected state
const updateCityOptions = (state) => {
    if (!pickupCitySelect) return;
    
    // Clear current options
    pickupCitySelect.innerHTML = '<option value="">Select City</option>';
    
    // If no state is selected, return
    if (!state) return;
    
    // Add cities for the selected state
    const cities = stateToCity[state] || [];
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        pickupCitySelect.appendChild(option);
    });
};

// Get current location
const getCurrentLocation = () => {
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                currentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Get location name from coordinates
                        getLocationNameFromCoordinates(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Current Location';
                        alert('Unable to get your location. Please enter it manually.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser. Please enter your location manually.');
            }
        });
    }
};

// Get location name from coordinates using Geocoding API
const getLocationNameFromCoordinates = async (latitude, longitude) => {
    try {
        // Find the closest city from our locations list
        findClosestCity(latitude, longitude);
    } catch (error) {
        console.error('Error getting location name:', error);
        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Current Location';
        alert('Unable to get your location. Please enter it manually.');
    }
};

// Simulate finding closest city in India (would use actual geocoding API in production)
const findClosestCity = (latitude, longitude) => {
    // Approximate coordinates for Indian IT hub cities
    const cityCoordinates = {
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Delhi NCR': { lat: 28.7041, lng: 77.1025 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 },
        'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
        'Jaipur': { lat: 26.9124, lng: 75.7873 },
        'Indore': { lat: 22.7196, lng: 75.8577 }
    };
    
    // Find closest city using Haversine formula
    let closestCity = '';
    let minDistance = Infinity;
    
    Object.entries(cityCoordinates).forEach(([city, coords]) => {
        const distance = getDistanceFromLatLonInKm(latitude, longitude, coords.lat, coords.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
        }
    });
    
    // If within 100km of a city, set it as the location
    if (minDistance <= 100) {
        const state = cityToState[closestCity];
        
        // Update dropdowns and address
        if (pickupStateSelect && state) {
            pickupStateSelect.value = state;
            updateCityOptions(state);
        }
        
        if (pickupCitySelect) {
            pickupCitySelect.value = closestCity;
        }
        
        if (pickupAddressInput) {
            pickupAddressInput.value = `Near ${closestCity} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }
        
        // Save to userLocation
        userLocation = {
            state: state,
            city: closestCity,
            address: `Near ${closestCity} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        };
    } else {
        // If not close to any city, just show coordinates and alert the user
        if (pickupAddressInput) {
            pickupAddressInput.value = `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }
        
        userLocation = {
            state: '',
            city: '',
            address: `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        };
        
        alert('Your location is not within our service area. Please select one of our supported cities.');
    }
    
    currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Current Location';
};

// Calculate distance between two coordinates using Haversine formula
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
};

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

// Initialize location options
const initializeLocationOptions = () => {
    // Nothing needed here since we're using select dropdowns with hardcoded values
    // This is kept for compatibility with the rest of the code
};

// Particle animation for hero section
class Particle {
    constructor(x, y, size, color, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.direction = Math.random() * Math.PI * 2; // Random direction
        this.opacity = Math.random() * 0.5 + 0.3; // Random opacity between 0.3 and 0.8
    }

    update() {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        
        // Bounce off edges
        if (this.x < 0 || this.x > window.innerWidth) {
            this.direction = Math.PI - this.direction;
        }
        if (this.y < 0 || this.y > window.innerHeight) {
            this.direction = -this.direction;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
    }
}

// Initialize particles for hero section
const initParticles = () => {
    if (!heroSection) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    
    // Make canvas responsive
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
    
    // Add canvas to hero section
    heroSection.appendChild(canvas);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Create particles
    const numParticles = Math.floor(canvas.width * canvas.height / 15000); // Adjust density
    const colors = [
        { r: 78, g: 128, b: 238 }, // primary color
        { r: 100, g: 181, b: 255 }, // secondary color
        { r: 255, g: 255, b: 255 } // white
    ];
    
    for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1; // Size between 1-3
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed = Math.random() * 0.2 + 0.1; // Speed between 0.1-0.3
        
        particles.push(new Particle(x, y, size, color, speed));
    }
    
    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
    });
};

// Dark theme particle effect for footer
const addFooterParticles = () => {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'footer-particles';
    particlesContainer.style.position = 'absolute';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.overflow = 'hidden';
    particlesContainer.style.zIndex = '0';
    
    footer.style.position = 'relative';
    footer.prepend(particlesContainer);
    
    // Create random stars
    const numParticles = Math.floor(particlesContainer.offsetWidth * particlesContainer.offsetHeight / 10000);
    
    for (let i = 0; i < numParticles; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size and opacity
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Set style
        star.style.position = 'absolute';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.borderRadius = '50%';
        star.style.backgroundColor = 'rgba(255, 255, 255, ' + opacity + ')';
        star.style.boxShadow = '0 0 ' + (size * 2) + 'px rgba(255, 255, 255, 0.8)';
        
        // Random animation delay and duration
        const animDelay = Math.random() * 3;
        const animDuration = Math.random() * 3 + 2;
        star.style.animation = `twinkle ${animDuration}s infinite ${animDelay}s`;
        
        particlesContainer.appendChild(star);
    }
    
    // Add keyframes for twinkling
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};

// Scroll animation for sections
const initScrollAnimations = () => {
    // Get all relevant sections
    const sections = [
        featuredSection,
        whyChooseUsSection,
        testimonialsSection,
        ctaSection,
        document.querySelector('.footer')
    ].filter(section => section); // Filter out null values
    
    // Function to check if element is in viewport
    const isInViewport = (element, offset = 100) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= offset
        );
    };
    
    // Function to animate sections
    const animateSections = () => {
        sections.forEach(section => {
            if (isInViewport(section)) {
                // Add animation class
                section.classList.add('fade-in');
                
                // Add animation class to child elements
                const titles = section.querySelectorAll('.section-title');
                const descriptions = section.querySelectorAll('.section-description');
                const cards = section.querySelectorAll('.car-card, .feature-card');
                
                titles.forEach((title, i) => {
                    title.classList.add('fade-in-up');
                    title.style.animationDelay = `${0.1 * i}s`;
                });
                
                descriptions.forEach((desc, i) => {
                    desc.classList.add('fade-in-up');
                    desc.style.animationDelay = `${0.2 + 0.1 * i}s`;
                });
                
                cards.forEach((card, i) => {
                    card.classList.add('fade-in-up');
                    card.style.animationDelay = `${0.3 + 0.1 * i}s`;
                });
            }
        });
    };
    
    // Initial check
    animateSections();
    
    // Check on scroll
    window.addEventListener('scroll', animateSections);
};

// Create a car card element with animations
const createCarCard = (car) => {
    const carCard = document.createElement('div');
    carCard.className = 'car-card';
    
    const tagHtml = car.new ? 
        '<div class="car-tag">New</div>' : 
        (car.popular ? '<div class="car-tag">Popular</div>' : '');
    
    carCard.innerHTML = `
        <div class="car-image">
            <img src="${car.image}" alt="${car.name}">
            ${tagHtml}
        </div>
        <div class="car-info">
            <h3>${car.name}</h3>
            <div class="car-features">
                <span><i class="fas fa-user"></i> ${car.seats} Seats</span>
                <span><i class="fas fa-suitcase"></i> ${car.luggage} Luggage</span>
                <span><i class="fas fa-gas-pump"></i> ${car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}</span>
                <span><i class="fas fa-cog"></i> ${car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}</span>
            </div>
            <div class="car-price">
                <span class="price">₹${car.price}</span> / day
            </div>
            <a href="#" class="btn-primary btn-block rent-now-btn" data-car-id="${car.id}">
                <span class="btn-text">Rent Now</span>
                <span class="btn-icon"><i class="fas fa-arrow-right"></i></span>
            </a>
        </div>
    `;
    
    // Add hover effects
    carCard.addEventListener('mouseenter', () => {
        // Add glow effect for dark theme
        if (darkThemeActive) {
            carCard.style.boxShadow = '0 10px 30px rgba(78, 128, 238, 0.3)';
            carCard.style.borderColor = 'var(--primary-color)';
        }
        
        // Button animation
        const button = carCard.querySelector('.rent-now-btn');
        const btnText = button.querySelector('.btn-text');
        const btnIcon = button.querySelector('.btn-icon');
        
        btnIcon.style.transform = 'translateX(4px)';
        btnIcon.style.opacity = '1';
    });
    
    carCard.addEventListener('mouseleave', () => {
        if (darkThemeActive) {
            carCard.style.boxShadow = 'var(--box-shadow)';
            carCard.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        }
        
        // Reset button animation
        const button = carCard.querySelector('.rent-now-btn');
        const btnText = button.querySelector('.btn-text');
        const btnIcon = button.querySelector('.btn-icon');
        
        btnIcon.style.transform = 'translateX(0)';
        btnIcon.style.opacity = '0.7';
    });
    
    return carCard;
};

// Display cars in the grid with animations
const displayCars = (cars) => {
    if (!carGrid) return;
    
    // Clear existing cars
    carGrid.innerHTML = '';
    
    // Show only the first 6 cars or all if less
    const displayCount = cars.length > 6 ? 6 : cars.length;
    
    if (cars.length === 0) {
        // No cars found message
        const noCarsMessage = document.createElement('div');
        noCarsMessage.className = 'no-cars-message';
        noCarsMessage.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No cars found matching your criteria</h3>
            <p>Please try adjusting your search filters.</p>
        `;
        carGrid.appendChild(noCarsMessage);
        
        // Hide view all button if no results
        const viewAllContainer = document.querySelector('.view-all-container');
        if (viewAllContainer) {
            viewAllContainer.style.display = 'none';
        }
        
        return;
    }
    
    // Add cars to grid
    for (let i = 0; i < displayCount; i++) {
        const carCard = createCarCard(cars[i]);
        carGrid.appendChild(carCard);
    }
    
    // Show view all button if more cars available
    const viewAllContainer = document.querySelector('.view-all-container');
    if (viewAllContainer) {
        viewAllContainer.style.display = cars.length > 6 ? 'block' : 'none';
    }
    
    // Add event listeners to Rent Now buttons
    addRentNowListeners();
    
    // Animate price numbers
    initPriceAnimation();

    // Add animation styles for button hover
    const style = document.createElement('style');
    style.textContent = `
        .rent-now-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            position: relative;
            overflow: hidden;
        }
        
        .btn-icon {
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0.7;
        }
        
        .rent-now-btn:hover .btn-icon {
            transform: translateX(4px);
            opacity: 1;
        }
        
        .btn-primary::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.1);
            transition: width 0.3s ease;
            z-index: -1;
        }
        
        .btn-primary:hover::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
};

// Add event listeners to Rent Now buttons
const addRentNowListeners = () => {
    document.querySelectorAll('.rent-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const carId = parseInt(btn.getAttribute('data-car-id'));
            const car = carsData.find(car => car.id === carId);
            
            if (car) {
                bookCar(car);
            }
        });
    });
};

// Book a car (placeholder function)
const bookCar = (car) => {
    // Get rental information from form if available
    let pickupDate = pickupDateInput ? pickupDateInput.value : '';
    let returnDate = returnDateInput ? returnDateInput.value : '';
    let state = pickupStateSelect ? pickupStateSelect.value : '';
    let city = pickupCitySelect ? pickupCitySelect.value : '';
    let address = pickupAddressInput ? pickupAddressInput.value : '';
    let tripType = tripTypeSelect ? tripTypeSelect.value : 'in-city';
    
    if (!pickupDate || !returnDate || !state || !city || !address) {
        // Show booking modal or redirect to booking page
        alert(`Please fill in all location details and dates for the ${car.name} rental.`);
        
        // Scroll to booking form
        const heroSearch = document.querySelector('.hero-search');
        if (heroSearch) {
            heroSearch.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // In a real application, you would redirect to a booking page or show a modal
        // For this demo, we'll just show an alert
        const tripTypeText = tripType === 'in-city' ? 'Within City' : 'Outstation';
        const locationText = `${address}, ${city}, ${state}`;
        alert(`Booking confirmed!\n\nCar: ${car.name}\nPickup: ${locationText} on ${pickupDate}\nReturn: ${returnDate}\nTrip Type: ${tripTypeText}\nTotal: ₹${car.price * getDaysCount(pickupDate, returnDate)}`);
    }
};

// Calculate days between two dates
const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
};

// Filter cars based on search criteria
const filterCars = (state, city, address, tripType, pickupDate, returnDate, carType) => {
    // Filter based on availability and location
    let filtered = carsData.filter(car => car.available);
    
    // Filter by city if provided
    if (city) {
        filtered = filtered.filter(car => 
            car.location.toLowerCase() === city.toLowerCase()
        );
    }
    
    // Filter by car type if provided
    if (carType) {
        filtered = filtered.filter(car => car.type === carType);
    }
    
    // Add filter logic for trip type - if outstation, prefer cars with better fuel efficiency
    if (tripType === 'out-city') {
        // For outstation, prioritize diesel cars or those with better fuel efficiency
        filtered.sort((a, b) => {
            // Diesel cars get priority for outstation
            if (a.fuel === 'diesel' && b.fuel !== 'diesel') return -1;
            if (a.fuel !== 'diesel' && b.fuel === 'diesel') return 1;
            
            // For in-city, smaller cars may be more practical
            if (tripType === 'in-city') {
                if (a.type === 'hatchback' && b.type !== 'hatchback') return -1;
                if (a.type !== 'hatchback' && b.type === 'hatchback') return 1;
            }
            
            return 0;
        });
    }
    
    // Sort by popularity and newness
    filtered.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        if (a.new && !b.new) return -1;
        if (!a.new && b.new) return 1;
        return 0;
    });
    
    return filtered;
};

// Initialize date pickers
const initDatePickers = () => {
    if (pickupDateInput && returnDateInput) {
        // Set minimum date to today for pickup
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;
        
        pickupDateInput.setAttribute('min', todayString);
        
        // When pickup date changes, update return date minimum
        pickupDateInput.addEventListener('change', () => {
            returnDateInput.setAttribute('min', pickupDateInput.value);
            
            // If return date is earlier than pickup date, reset it
            if (returnDateInput.value && returnDateInput.value < pickupDateInput.value) {
                returnDateInput.value = pickupDateInput.value;
            }
        });
    }
};

// Search Form Submission
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const state = pickupStateSelect ? pickupStateSelect.value : '';
        const city = pickupCitySelect ? pickupCitySelect.value : '';
        const address = pickupAddressInput ? pickupAddressInput.value : '';
        const tripType = tripTypeSelect ? tripTypeSelect.value : 'in-city';
        const pickupDate = pickupDateInput ? pickupDateInput.value : '';
        const returnDate = returnDateInput ? returnDateInput.value : '';
        const carType = carTypeSelect ? carTypeSelect.value : '';
        
        // Validate form
        if (!state || !city || !address || !pickupDate || !returnDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Filter cars based on criteria
        filteredCars = filterCars(state, city, address, tripType, pickupDate, returnDate, carType);
        
        // Display filtered cars
        displayCars(filteredCars);
        
        // Scroll to cars section
        const featuredCarsSection = document.querySelector('.featured-cars');
        if (featuredCarsSection) {
            featuredCarsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Testimonials Slider Functionality
let currentTestimonial = 0;
const testimonials = testimonialSlider ? testimonialSlider.querySelectorAll('.testimonial') : [];
const testimonialCount = testimonials.length;

// Hide all testimonials except the first one
const initTestimonials = () => {
    if (!testimonialSlider) return;
    
    testimonials.forEach((testimonial, index) => {
        if (index !== 0) {
            testimonial.style.display = 'none';
        }
    });
};

// Show the current testimonial and hide others
const showTestimonial = (index) => {
    testimonials.forEach((testimonial, i) => {
        if (i === index) {
            testimonial.style.display = 'block';
            testimonial.style.opacity = 0;
            
            // Fade in effect
            setTimeout(() => {
                testimonial.style.transition = 'opacity 0.5s ease';
                testimonial.style.opacity = 1;
            }, 50);
        } else {
            testimonial.style.display = 'none';
        }
    });
};

// Next testimonial button
if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonialCount;
        showTestimonial(currentTestimonial);
    });
}

// Previous testimonial button
if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonialCount) % testimonialCount;
        showTestimonial(currentTestimonial);
    });
}

// Automatic testimonial slider
let testimonialInterval;
const startTestimonialInterval = () => {
    if (!testimonialSlider) return;
    
    testimonialInterval = setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonialCount;
        showTestimonial(currentTestimonial);
    }, 5000); // Change testimonial every 5 seconds
};

// Stop automatic slider on hover
if (testimonialSlider) {
    testimonialSlider.addEventListener('mouseenter', () => {
        clearInterval(testimonialInterval);
    });

    // Resume automatic slider when not hovering
    testimonialSlider.addEventListener('mouseleave', () => {
        startTestimonialInterval();
    });
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's a button with a # placeholder
        if (href === '#' && !this.classList.contains('nav-link')) {
            return;
        }
        
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70, // Adjusted for fixed navbar
                behavior: 'smooth'
            });
        }
    });
});

// Fancy animation for price numbers
const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = '₹' + Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Initialize price animation
const initPriceAnimation = () => {
    const priceElements = document.querySelectorAll('.price');
    if (priceElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const priceElement = entry.target;
                    const price = parseInt(priceElement.textContent.replace(/[^0-9]/g, ''));
                    
                    // Start animation from 0 to the price
                    animateValue(priceElement, 0, price, 1000);
                    
                    // Unobserve after animation
                    observer.unobserve(priceElement);
                }
            });
        }, { threshold: 0.5 });
        
        priceElements.forEach(price => {
            observer.observe(price);
        });
    }
};

// Add fancy hover effects to car cards
const initCarCardHoverEffects = () => {
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });
};

// Handle the View All Cars button
const initViewAllButton = () => {
    const viewAllBtn = document.querySelector('.view-all-container .btn-secondary');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Display all filtered cars
            displayAllCars();
            
            // Hide the View All button
            viewAllBtn.parentElement.style.display = 'none';
        });
    }
};

// Display all filtered cars
const displayAllCars = () => {
    if (!carGrid) return;
    
    // Clear existing cars
    carGrid.innerHTML = '';
    
    // Add all filtered cars to grid
    filteredCars.forEach(car => {
        const carCard = createCarCard(car);
        carGrid.appendChild(carCard);
    });
    
    // Add event listeners to Rent Now buttons
    addRentNowListeners();
    
    // Animate price numbers
    initPriceAnimation();
};

// Initialize the page with animations
window.addEventListener('DOMContentLoaded', () => {
    // Fetch car data
    fetchCarsData();
    
    // Initialize date pickers
    initDatePickers();
    
    // Set up testimonial slider
    initTestimonials();
    startTestimonialInterval();
    
    // Initialize view all button
    initViewAllButton();
    
    // Initialize car card hover effects
    initCarCardHoverEffects();
    
    // Initialize particle animations
    initParticles();
    
    // Initialize footer particles
    addFooterParticles();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Add active class to the nav link based on the current page
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref === currentLocation || (currentLocation === '/' && itemHref === 'index.html')) {
            item.classList.add('active');
        }
    });

    // Add typing effect to hero heading
    const heroHeading = document.querySelector('.hero-content h1');
    if (heroHeading) {
        const text = heroHeading.textContent;
        heroHeading.textContent = '';
        heroHeading.style.borderRight = '3px solid var(--primary-color)';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroHeading.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 70);
            } else {
                heroHeading.style.borderRight = 'none';
            }
        };
        
        setTimeout(typeWriter, 500);
    }
    
    // Custom CSS for nav toggle animation
    const style = document.createElement('style');
    style.textContent = `
        .nav-toggle span.active:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }
        .nav-toggle span.active:nth-child(2) {
            opacity: 0;
        }
        .nav-toggle span.active:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }
        
        .no-cars-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background-color: var(--bg-color);
            border-radius: 10px;
            box-shadow: var(--box-shadow);
        }
        
        .no-cars-message i {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .no-cars-message h3 {
            margin-bottom: 0.5rem;
        }
        
        .no-cars-message p {
            color: var(--text-light);
        }
    `;
    document.head.appendChild(style);
}); 