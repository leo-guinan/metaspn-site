// Blog Post JavaScript

// Generate Table of Contents
function generateTOC() {
    const headings = document.querySelectorAll('.post-body h2, .post-body h3, .post-body h4');
    const tocList = document.getElementById('toc-list');
    
    if (!tocList || headings.length === 0) {
        // Hide TOC if no headings or no TOC element
        const toc = document.getElementById('toc');
        if (toc) {
            toc.style.display = 'none';
        }
        return;
    }
    
    headings.forEach((heading, index) => {
        // Create ID for heading if it doesn't exist
        if (!heading.id) {
            const id = heading.textContent
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            heading.id = id;
        }
        
        // Create TOC item
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        
        // Add indentation for h3 and h4
        if (heading.tagName === 'H3') {
            a.style.paddingLeft = '1rem';
        } else if (heading.tagName === 'H4') {
            a.style.paddingLeft = '2rem';
        }
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Smooth scroll for TOC links
function initTOCSmoothScroll() {
    const tocLinks = document.querySelectorAll('#toc-list a');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add reading progress indicator
function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--neon-blue);
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const article = document.querySelector('.post-body');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        const progress = Math.min(
            Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
            1
        );
        
        progressBar.style.width = `${progress * 100}%`;
    });
}

// Add copy code functionality
function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'copy-code-btn';
        button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--neon-blue);
            color: var(--black);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: background 0.3s ease;
        `;
        
        pre.style.position = 'relative';
        pre.appendChild(button);
        
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        });
    });
}

// Add estimated reading time
function calculateReadingTime() {
    const article = document.querySelector('.post-body');
    if (!article) return;
    
    const text = article.textContent;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    const readTimeElement = document.querySelector('.read-time');
    if (readTimeElement) {
        readTimeElement.textContent = `${readingTime} min read`;
    }
}

// Add social sharing buttons
function initSocialSharing() {
    const postTitle = document.querySelector('.post-title').textContent;
    const postUrl = window.location.href;
    const postDescription = document.querySelector('.post-excerpt p').textContent;
    
    // Create sharing buttons container
    const sharingContainer = document.createElement('div');
    sharingContainer.className = 'social-sharing';
    sharingContainer.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 2rem 0;
        padding: 2rem;
        background: var(--gray-dark);
        border-radius: 12px;
        border: 1px solid var(--gray-medium);
    `;
    
    // Twitter share
    const twitterBtn = document.createElement('a');
    twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
    twitterBtn.target = '_blank';
    twitterBtn.textContent = 'Share on Twitter';
    twitterBtn.style.cssText = `
        background: #1da1f2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        font-size: 0.9rem;
        transition: background 0.3s ease;
    `;
    
    // LinkedIn share
    const linkedinBtn = document.createElement('a');
    linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    linkedinBtn.target = '_blank';
    linkedinBtn.textContent = 'Share on LinkedIn';
    linkedinBtn.style.cssText = `
        background: #0077b5;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        font-size: 0.9rem;
        transition: background 0.3s ease;
    `;
    
    // Copy link
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Link';
    copyBtn.style.cssText = `
        background: var(--neon-blue);
        color: var(--black);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        font-size: 0.9rem;
        border: none;
        cursor: pointer;
        transition: background 0.3s ease;
    `;
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Link';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    });
    
    sharingContainer.appendChild(twitterBtn);
    sharingContainer.appendChild(linkedinBtn);
    sharingContainer.appendChild(copyBtn);
    
    // Insert after post body
    const postBody = document.querySelector('.post-body');
    if (postBody) {
        postBody.appendChild(sharingContainer);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    generateTOC();
    initTOCSmoothScroll();
    initReadingProgress();
    initCodeCopyButtons();
    calculateReadingTime();
    initSocialSharing();
    
    console.log('Blog post features loaded');
});
