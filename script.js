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

function scrollToPods() {
    document.getElementById('pods').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Video modal (now embedded directly)
function openVideo() {
    // Video is now embedded in the Week 1 Feature section
    document.querySelector('.week1-feature').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Sponsor form (Tally form)
function openSponsorForm() {
    window.open('https://tally.so/r/mOpBdp', '_blank');
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

// Featured Posts functionality - Load from embedded data (no CORS needed!)
function loadFeaturedPosts() {
    const container = document.getElementById('featured-posts-grid');
    if (!container) return;

    try {
        // Get embedded posts data from the page (injected during build)
        const dataScript = document.getElementById('featured-posts-data');
        if (!dataScript) {
            console.log('No featured posts data found - posts will be generated during build');
            return;
        }

        const posts = JSON.parse(dataScript.textContent);

        if (posts.length === 0) {
            console.log('No featured posts found');
            return;
        }

        // Clear any existing content
        container.innerHTML = '';

        // Create post cards
        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'featured-post-card';
            
            const slug = post.slug || '';
            const imageUrl = post.featuredImage?.url || 'images/blog-og.jpg';
            const publishedDate = post.publishedAt 
                ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : '';
            const tags = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');
            const readTime = post.readTime ? `${post.readTime} min read` : '5 min read';
            
            card.innerHTML = `
                <div class="featured-post-image">
                    <img src="${imageUrl}" alt="${post.title || ''}" loading="lazy">
                </div>
                <div class="featured-post-content">
                    <div class="featured-post-meta">
                        <span class="featured-post-date">${publishedDate}</span>
                        <span class="featured-post-tags">${tags}</span>
                    </div>
                    <h3 class="featured-post-title">
                        <a href="blog/${slug}.html">${post.title || 'Untitled'}</a>
                    </h3>
                    <p class="featured-post-excerpt">${post.excerpt || post.description || ''}</p>
                    <div class="featured-post-footer">
                        <div class="featured-post-author">
                            <span>Leo Guinan</span>
                        </div>
                        <span class="featured-post-read-time">${readTime}</span>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        console.log('✅ Featured posts loaded:', posts.map(p => p.title));
        
    } catch (error) {
        console.error('❌ Error loading featured posts:', error);
        // Fallback: show message or hide section
        container.innerHTML = '<p style="color: var(--gray-light); text-align: center;">Loading posts...</p>';
    }
}

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('.theme-toggle-icon');
    const root = document.documentElement;
    
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
    });
    
    console.log('✅ Theme toggle initialized');
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollAnimations();
    animateScoreboard();
    animateChart();
    initPhilosophyCards();
    initParallax();
    loadFeaturedPosts();
    
    // Add some console logging for debugging
    console.log('MetaSPN Landing Page Loaded');
    console.log('ConvertKit form embed active');
    console.log('Featured posts functionality active');
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
