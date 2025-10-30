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

// Featured Posts functionality
function loadFeaturedPosts() {
    const posts = [
        {
            title: "🏁 The MetaSPN League: Building the Conscious Metrics Network",
            excerpt: "The MetaSPN League is a living network of founders, investors, and operators building the next generation of organizational metrics. Join the conscious metrics network.",
            image: "images/metaspn-league-featured.png",
            link: "blog/the-metaspn-league-building-conscious-metrics-network.html",
            date: "October 27, 2024",
            tags: "MetaSPN League, Conscious Metrics",
            readTime: "6 min read"
        },
        {
            title: "🌐 The Four Hidden Variables of Conscious Business",
            excerpt: "Every company has surface metrics, but beneath them lives the alignment layer that determines whether the whole thing compounds or collapses. Learn the four hidden variables.",
            image: "images/four-variables-featured.png",
            link: "blog/the-four-hidden-variables-of-conscious-business.html",
            date: "October 27, 2024",
            tags: "Conscious Business, Alignment Variables",
            readTime: "8 min read"
        },
        {
            title: "📈 Predictability Is the New Productivity",
            excerpt: "In the acceleration age, productivity is no longer about output per input—it's about predictability. Learn how alignment metrics measure the true performance curve.",
            image: "images/predictability-productivity-featured.png",
            link: "blog/predictability-is-the-new-productivity.html",
            date: "October 27, 2024",
            tags: "Predictability, Productivity",
            readTime: "7 min read"
        },
        {
            title: "⏳ What Is Time Violence — and How to Prevent It in Your Organization",
            excerpt: "Time violence is the systemic waste of human attention through misalignment. Learn how to identify, measure, and prevent it in your organization.",
            image: "images/time-violence-featured.png",
            link: "blog/what-is-time-violence.html",
            date: "October 27, 2024",
            tags: "Time Violence, Organizational Alignment",
            readTime: "5 min read"
        },
        {
            title: "🧭 How to Measure Learning Velocity",
            excerpt: "The true bottleneck in every organization isn't execution—it's learning. Learn how to measure Learning Velocity, the rate at which teams convert uncertainty into knowledge.",
            image: "images/learning-velocity-featured.png",
            link: "blog/how-to-measure-learning-velocity.html",
            date: "October 27, 2024",
            tags: "Learning Velocity, Organizational Learning",
            readTime: "6 min read"
        },
        {
            title: "⚙️ The Metagame of Metrics: Measuring Trust and Coordination",
            excerpt: "Every organization runs two games: the visible game of tasks and deliverables, and the metagame of coordination. Learn how to measure the invisible process.",
            image: "images/metagame-metrics-featured.png",
            link: "blog/the-metagame-of-metrics.html",
            date: "October 27, 2024",
            tags: "Metrics, Alignment, Coordination",
            readTime: "7 min read"
        },
        {
            title: "🧮 Why OKRs Are Breaking: The Metric Crisis of the Acceleration Age",
            excerpt: "OKRs were built for static worlds, but we live in dynamic ones. The real currency of modern organizations isn't revenue—it's alignment velocity.",
            image: "images/okrs-breaking-featured.png",
            link: "blog/why-okrs-are-breaking.html",
            date: "October 27, 2024",
            tags: "OKRs, Metrics, Alignment",
            readTime: "8 min read"
        }
    ];

    // Randomly select 3 posts
    const shuffled = posts.sort(() => 0.5 - Math.random());
    const selectedPosts = shuffled.slice(0, 3);

    // Get the container
    const container = document.getElementById('featured-posts-grid');
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create post cards
    selectedPosts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'featured-post-card';
        
        card.innerHTML = `
            <div class="featured-post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="featured-post-content">
                <div class="featured-post-meta">
                    <span class="featured-post-date">${post.date}</span>
                    <span class="featured-post-tags">${post.tags}</span>
                </div>
                <h3 class="featured-post-title">
                    <a href="${post.link}">${post.title}</a>
                </h3>
                <p class="featured-post-excerpt">${post.excerpt}</p>
                <div class="featured-post-footer">
                    <div class="featured-post-author">
                        <span>Leo Guinan</span>
                    </div>
                    <span class="featured-post-read-time">${post.readTime}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Track which posts are being shown for analytics
    console.log('Featured posts loaded:', selectedPosts.map(p => p.title));
    
    // Send data to Fathom if available
    if (window.fathom) {
        window.fathom.trackEvent('featured_posts_loaded', {
            posts: selectedPosts.map(p => p.title)
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
