// MetaSPN Landing Page JavaScript

// Smooth scrolling for navigation
function scrollToSignup() {
    document.getElementById('signup').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function scrollToSponsor() {
    document.getElementById('sponsor').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function scrollToScoreboard() {
    document.getElementById('scoreboard').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Video modal (placeholder)
function openVideo() {
    // For now, just show an alert. Replace with actual video modal
    alert('Day 0 Update video will be embedded here');
}

// Sponsor form (placeholder)
function openSponsorForm() {
    // For now, just show an alert. Replace with actual sponsor form
    alert('Sponsor application form will open here');
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Scoreboard animations
function animateScoreboard() {
    const scoreItems = document.querySelectorAll('.score-fill');
    
    const scoreboardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const score = entry.target.getAttribute('data-score');
                entry.target.style.width = score + '%';
            }
        });
    }, { threshold: 0.5 });

    scoreItems.forEach(item => {
        scoreboardObserver.observe(item);
    });
}

// ConvertKit form is now handled by the embed script

// Chart animation
function animateChart() {
    const chartContainer = document.querySelector('.chart-container');
    
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lines = entry.target.querySelectorAll('.chart-line');
                lines.forEach((line, index) => {
                    setTimeout(() => {
                        line.style.width = '100%';
                    }, index * 500);
                });
            }
        });
    }, { threshold: 0.5 });

    if (chartContainer) {
        chartObserver.observe(chartContainer);
    }
}

// Philosophy cards interaction
function initPhilosophyCards() {
    const cards = document.querySelectorAll('.philosophy-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            cards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');
        });
    });
}

// Parallax effect for hero section
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroGradient = document.querySelector('.hero-gradient');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroGradient) {
            heroGradient.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    animateScoreboard();
    animateChart();
    initPhilosophyCards();
    initParallax();
    
    // Add some console logging for debugging
    console.log('MetaSPN Landing Page Loaded');
    console.log('ConvertKit form embed active');
});

// Add some utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/dist/smoothscroll.min.js';
    document.head.appendChild(script);
}
