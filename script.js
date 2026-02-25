lucide.createIcons();

// ── Mobile Menu ──────────────────────────────────────────
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('menuToggle');
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-label', 'فتح القائمة');
    } else {
        menu.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-label', 'إغلاق القائمة');
    }
}

function closeMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('menuToggle');
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-label', 'فتح القائمة');
}

document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    if (!nav.contains(e.target)) closeMenu();
});

// ── Dynamic Data Handling & Variables ─────────────────────
let quotesData = [];
let currentQuoteIndex = 0;
let isTransitioning = false;

// Note: To use fetch('data.json') properly, you need to open this project
// via a local server (like the "Live Server" extension in VS Code)
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        renderEpisodes(data.episodes);
        quotesData = data.quotes;
        initSlider();
    })
    .catch(error => console.error("Error loading JSON data:", error));


// ── Render Episodes with YouTube Logic ────────────────────
function renderEpisodes(episodes) {
    const grid = document.getElementById('episodesGrid');
    
    episodes.forEach(ep => {
        // Check if youtube link is present to determine if the episode is "published"
        const isPublished = ep.youtubeLink && ep.youtubeLink.trim() !== "";
        
        // 1. Overlay HTML: Click to play local video in the modal
        const overlayHTML = isPublished 
            ? `<div onclick="openVideo('${ep.videoFile}')" class="flex flex-col items-center justify-center w-full h-full text-white cursor-pointer hover:scale-105 transition-transform"><i data-lucide="play-circle" size="48" class="mb-2"></i><span class="text-xl font-bold amiri">تشغيل المقطع</span></div>`
            : `<div class="text-center cursor-not-allowed w-full h-full flex items-center justify-center"><div class="text-white text-2xl font-bold amiri">قريباً</div></div>`;
        
        // 2. Button HTML: Link to YouTube
        const buttonHTML = isPublished
            ? `<a href="${ep.youtubeLink}" target="_blank" class="text-sm font-bold text-[#c5a059] flex items-center gap-2 hover:gap-3 transition-all">مشاهدة على يوتيوب <i data-lucide="youtube" size="14"></i></a>`
            : `<button class="text-sm font-bold text-[#c5a059] flex items-center gap-2 hover:gap-3 transition-all opacity-60 cursor-not-allowed">قريباً <i data-lucide="chevron-left" size="14"></i></button>`;

        const card = document.createElement('div');
        card.className = 'episode-card scroll-reveal';
        card.innerHTML = `
            <div class="relative overflow-hidden aspect-video group">
                <img src="${ep.cover}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${ep.title}">
                <div class="video-overlay ${isPublished ? '' : 'cursor-not-allowed'}">
                    ${overlayHTML}
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-[#c5a059] font-bold text-xs tracking-widest">الحلقة ${ep.id}</span>
                    </div>
                    <h3 class="text-xl font-bold text-[#2d4a3e] amiri mb-3">${ep.title}</h3>
                    <p class="text-gray-600 text-sm leading-relaxed mb-4">${ep.desc}</p>
                </div>
                <div class="mt-auto pt-4 flex justify-between items-center">
                    ${buttonHTML}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Re-initialize icons and scroll reveal for dynamically added items
    lucide.createIcons();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// ── Slider Logic ──────────────────────────────────────────
function initSlider() {
    if(!quotesData || quotesData.length === 0) return;
    
    const dotsContainer = document.getElementById('quoteDots');
    quotesData.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === 0 ? 'bg-[#c5a059] w-6' : 'bg-white/30'}`;
        dot.id = `dot-${idx}`;
        dot.onclick = () => { if (!isTransitioning) { isTransitioning = true; currentQuoteIndex = idx; updateQuote(idx); } };
        dotsContainer.appendChild(dot);
    });
    updateQuote(0);
}

function updateQuote(index) {
    if(!quotesData || quotesData.length === 0) return;

    const img = document.getElementById('quoteImg');
    const textContainer = document.getElementById('quoteTextContainer');
    img.style.opacity = '0';
    img.style.transform = 'scale(1.05)';
    textContainer.style.opacity = '0';
    textContainer.style.transform = 'translateY(15px)';

    setTimeout(() => {
        img.src = quotesData[index].img;
        document.getElementById('quoteLabel').innerText = quotesData[index].label;
        document.getElementById('quoteTitle').innerHTML = quotesData[index].title;
        document.getElementById('quoteDesc').innerText = quotesData[index].desc;
        quotesData.forEach((_, idx) => {
            const dot = document.getElementById(`dot-${idx}`);
            if (idx === index) { dot.classList.add('bg-[#c5a059]', 'w-6'); dot.classList.remove('bg-white/30'); }
            else { dot.classList.remove('bg-[#c5a059]', 'w-6'); dot.classList.add('bg-white/30'); }
        });
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        textContainer.style.opacity = '1';
        textContainer.style.transform = 'translateY(0)';
        isTransitioning = false;
    }, 500);
}

function changeQuote(dir) {
    if (isTransitioning || !quotesData.length) return;
    isTransitioning = true;
    currentQuoteIndex = (currentQuoteIndex + dir + quotesData.length) % quotesData.length;
    updateQuote(currentQuoteIndex);
}

setInterval(() => { if (!isTransitioning && quotesData.length) changeQuote(1); }, 7000);

// ── Counters ──────────────────────────────────────────────
function initCounters() {
    const counters = document.querySelectorAll('.stat-counter');
    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 500;
        if (count < target) { counter.innerText = Math.ceil(count + increment); setTimeout(() => animateCounter(counter), 50); }
        else { counter.innerText = target; }
    };
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); } });
    }, { threshold: 0.9 });
    counters.forEach(counter => counterObserver.observe(counter));
}

// ── Video Modal ───────────────────────────────────────────
function openVideo(filePath, autoPlay = true) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalVideoPlayer');
    document.getElementById('modalVideoSrc').src = filePath;
    player.load();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (autoPlay) player.play().catch(e => console.log("Auto-play prevented"));
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalVideoPlayer');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    try { player.pause(); player.currentTime = 0; player.src = ""; player.load(); } catch (e) { }
}

window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideo(); });

// ── Teaser Mute Toggle ────────────────────────────────────
function toggleTeaserMute() {
    const video = document.getElementById('teaserVideo');
    const icon = document.getElementById('muteIcon');
    const label = document.getElementById('muteLabel');
    const btn = document.getElementById('muteToggle');

    video.muted = !video.muted;

    if (video.muted) {
        icon.setAttribute('data-lucide', 'volume-x');
        label.innerText = 'تشغيل الصوت';
        btn.classList.remove('border-[#c5a059]/60', 'bg-[#c5a059]/20');
    } else {
        icon.setAttribute('data-lucide', 'volume-2');
        label.innerText = 'كتم الصوت';
        btn.classList.add('border-[#c5a059]/60', 'bg-[#c5a059]/20');
    }
    lucide.createIcons();
}

// ── Init & Teaser Video Autoplay on Scroll ────────────────
window.onload = () => {
    initCounters();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
};

const teaserVideo = document.getElementById('teaserVideo');
if (teaserVideo) {
    const teaserObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                teaserVideo.play().catch(() => { });
            } else {
                teaserVideo.pause();
            }
        });
    }, { threshold: 0.3 });
    teaserObserver.observe(teaserVideo);
    
    // Responsive Video Loading
    function loadResponsiveVideo() {
        const videoSource = document.getElementById('teaserVideoSource');
        const teaserVideo = document.getElementById('teaserVideo');
        const isDesktop = window.innerWidth >= 768;
        const desktopSrc = 'video.mp4';
        const mobileSrc = 'video.mp4';
        const newSrc = isDesktop ? desktopSrc : mobileSrc;

        if (videoSource.src !== newSrc) {
            videoSource.src = newSrc;
            teaserVideo.load();
        }
    }

    loadResponsiveVideo();
    window.addEventListener('resize', loadResponsiveVideo);
}