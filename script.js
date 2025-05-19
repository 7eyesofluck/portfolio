// Smooth scroll for nav links and scroll-down arrow
document.querySelectorAll('nav a, .scroll-down').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        } else if (this.classList.contains('scroll-down')) {
            e.preventDefault();
            document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// GSAP scroll animations for sections
gsap.utils.toArray("section").forEach(section => {
  gsap.fromTo(section, 
    { opacity: 0, y: 40 }, 
    { 
      opacity: 1, 
      y: 0, 
      duration: 1, 
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
        // markers: true // Uncomment for debugging
      }
    }
  );
});

// Unique project card animation on hover
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', `50%`);
        card.style.setProperty('--mouse-y', `50%`);
    });
});

// Header nav glow on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// --- Dots Grid and Random Glow Animation ---
(function() {
    const container = document.getElementById('background-dots');
    const dotSpacing = 48; // px between dots
    const dotSize = 4;

    function renderDots() {
        container.innerHTML = '';
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cols = Math.ceil(width / dotSpacing);
        const rows = Math.ceil(height / dotSpacing);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.style.left = `${x * dotSpacing}px`;
                dot.style.top = `${y * dotSpacing}px`;
                container.appendChild(dot);
            }
        }
    }

    renderDots();
    window.addEventListener('resize', renderDots);
})();

// --- Random Glow Circle Animation ---
(function() {
    const glow = document.getElementById('background-glow');
    const glowSize = 600; // px, matches background-size in CSS
    let animating = false;

    function randomGlowPosition() {
        // Allow the center to be anywhere in the viewport
        const xPercent = Math.random() * 100;
        const yPercent = Math.random() * 100;
        glow.style.setProperty('--glow-x', `${xPercent}%`);
        glow.style.setProperty('--glow-y', `${yPercent}%`);
    }

    function animateGlow() {
        if (animating) return;
        animating = true;
        
        // Position the glow at a random location
        randomGlowPosition();
        
        // Fade in (2.5s)
        glow.style.opacity = '1';
        
        // After 2.5s, start fading out
        setTimeout(() => {
            // Fade out (2.5s)
            glow.style.opacity = '0';
            
            // After fade out completes, prepare for next animation
            setTimeout(() => {
                animating = false;
                animateGlow();
            }, 2500);
        }, 2500);
    }

    // Start the animation
    animateGlow();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (!animating) {
            glow.style.opacity = '0';
            setTimeout(animateGlow, 500);
        }
    });
})();

// IMPORTANT: Remove any other glow animation functions or IIFEs
// Make sure this is the only glow animation code in your script.js


// Section Scroll Snapping
(function() {
    // Get all sections that should snap, including header
    const sections = document.querySelectorAll('header, section');
    let isScrolling = false;
    let scrollTimeout;
    
    // Function to handle scrolling to a section
    function scrollToSection(section) {
        if (isScrolling) return;
        
        isScrolling = true;
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Reset the scrolling flag after animation completes
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
    
    // Handle wheel events for immediate snapping
    let lastScrollTime = 0;
    window.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent default scroll
        
        const now = Date.now();
        // Reduce throttle time for more responsive scrolling
        if (now - lastScrollTime < 200) return;
        lastScrollTime = now;
        
        if (isScrolling) return;
        
        // Find the current section
        const currentSection = Array.from(sections).find(section => {
            const rect = section.getBoundingClientRect();
            // Wider detection area
            return rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2;
        });
        
        if (!currentSection) return;
        
        // Determine which section to scroll to
        const currentIndex = Array.from(sections).indexOf(currentSection);
        const nextIndex = e.deltaY > 0 ? 
            Math.min(currentIndex + 1, sections.length - 1) : 
            Math.max(currentIndex - 1, 0);
            
        scrollToSection(sections[nextIndex]);
    }, { passive: false });
    
    // Handle nav links clicking
    document.querySelectorAll('nav a, .scroll-down').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    scrollToSection(targetSection);
                }
            } else if (this.classList.contains('scroll-down')) {
                e.preventDefault();
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    scrollToSection(aboutSection);
                }
            }
        });
    });
    
    // Handle keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        // Find current section
        const currentSection = Array.from(sections).find(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2;
        });
        
        if (!currentSection) return;
        
        const currentIndex = Array.from(sections).indexOf(currentSection);
        let nextIndex = currentIndex;
        
        // Arrow down, Page Down, Space = next section
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            nextIndex = Math.min(currentIndex + 1, sections.length - 1);
            e.preventDefault();
        }
        // Arrow up, Page Up = previous section
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            nextIndex = Math.max(currentIndex - 1, 0);
            e.preventDefault();
        }
        
        if (nextIndex !== currentIndex) {
            scrollToSection(sections[nextIndex]);
        }
    });
})();
