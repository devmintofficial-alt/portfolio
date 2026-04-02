// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- Loading Screen ---
    const loaderText = document.getElementById('loader-text');
    const loaderLine = document.getElementById('loader-line');
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPercent = document.getElementById('loader-percent');

    // Prevent scroll while loading
    document.body.style.overflow = 'hidden';

    const chars = document.querySelectorAll('#loader-text .char');
    const remainingGreetings = ['Hola', 'Bonjour', 'Hallo', 'Ciao', '你好', 'こんにちは', 'नमस्ते'];

    // Set initial states
    gsap.set(loaderLine, { scaleX: 0 });
    gsap.set(chars, { opacity: 0, y: 20 });

    const loaderTl = gsap.timeline({
        onComplete: () => {
            gsap.timeline()
                .to([loaderText, loaderLine], {
                    opacity: 0,
                    y: -30,
                    duration: 0.4,
                    ease: 'power3.in',
                    stagger: 0.05
                })
                .to(loader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                    onComplete: () => {
                        loader.remove();
                        document.body.style.overflow = '';
                        startPageAnimations();
                    }
                });
        }
    });

    // Step 1: Line scales in
    loaderTl.to(loaderLine, { scaleX: 1, duration: 0.5, ease: 'power2.out' });

    // Step 2: HELLO — each character appears one by one + start loading bar
    loaderTl.add('greetingsStart');
    chars.forEach((char, i) => {
        loaderTl.to(char, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, i === 0 ? '+=0.1' : '-=0.05');
    });

    // Hold HELLO briefly, then fade out
    loaderTl
        .to(loaderText, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.5');

    // Step 3: Remaining greetings — wash out transition
    remainingGreetings.forEach((word) => {
        loaderTl
            .call(() => { loaderText.textContent = word; })
            .set(loaderText, { opacity: 0, filter: 'blur(0px)', scale: 1 })
            .to(loaderText, { opacity: 1, duration: 0.2, ease: 'power2.out' })
            .to(loaderText, {
                opacity: 0,
                scale: 1.3,
                filter: 'blur(12px)',
                duration: 0.35,
                ease: 'power1.in'
            }, '+=0.1');
    });

    // Add end label and attach loading bar from greetingsStart to greetingsEnd
    loaderTl.add('greetingsEnd');
    const greetingsDuration = loaderTl.labels['greetingsEnd'] - loaderTl.labels['greetingsStart'];
    const progress = { value: 0 };
    loaderTl.to(loaderBar, { width: '100%', duration: greetingsDuration, ease: 'none' }, 'greetingsStart');
    loaderTl.to(progress, {
        value: 100,
        duration: greetingsDuration,
        ease: 'none',
        onUpdate: () => {
            loaderPercent.textContent = Math.round(progress.value) + '%';
        }
    }, 'greetingsStart');

    function startPageAnimations() {
    // Initial State Setup
    gsap.set('.logo', { y: -50, opacity: 0 });
    gsap.set('.navbar', { y: -50, opacity: 0 });
    gsap.set('.text-bg-row', { opacity: 0 });

    // Timeline for Page Load
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // header drop in
    tl.to('.logo', { y: 0, opacity: 1, duration: 1 })
        .to('.navbar', { y: 0, opacity: 1, duration: 1 }, "-=0.8")

        // bg rows fade in subtly
        .to('.text-bg-row', {
            opacity: 1,
            duration: 2,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.5");

    // Horizontal Scrolling Rows
    const rows = document.querySelectorAll('.text-bg-row');
    rows.forEach((row, index) => {
        // 0, 2, 4 go left (-1), 1, 3 go right (1)
        const direction = index % 2 === 0 ? -1 : 1;

        // Items are duplicated 2x in HTML, so moving 50% gives a seamless loop
        if (direction === 1) {
            gsap.set(row, { xPercent: -50 });
        }

        gsap.to(row, {
            xPercent: direction === -1 ? -50 : 0,
            ease: "none",
            duration: 60, // Slowing down the scrolling speed
            repeat: -1
        });
    });

    // Smooth Scrolling for Navbar Links
    const navLinks = document.querySelectorAll('.nav-link');

    // Update active dot on scroll
    const sections = ['home', 'features', 'about', 'contact'];

    sections.forEach((id, index) => {
        const section = document.getElementById(id);
        if (!section) return;

        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                    document.querySelectorAll('.nav-links li')[index].classList.add('active');
                }
            }
        });
    });

    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            gsap.to(window, {
                duration: 1,
                scrollTo: targetId,
                ease: "power3.inOut"
            });
        });
    });

    // ===== Feature Cards — 3D Carousel (CSS-driven) =====

    } // end startPageAnimations

    /* ── CUSTOM CURSOR ── */
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    // Ring follows with smooth lag
    (function animRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animRing);
    })();

    // Expand on hover over links / buttons / cards
    document.querySelectorAll('a, button, .pill, .card, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // ── Ticker ──
    const tickerItems = [
        "Websites Built in 48 Hours",
        "Small Businesses, Big Results",
        "One Price. One Week. Live.",
        "US Service Businesses Only",
        "Closed on Live Video Call",
        "Every Site Ranked & Ready",
        "From Outdated to Outstanding",
        "Built to Convert, Not Just Look Good",
    ];
    const tickerTrack = document.getElementById('ticker-track');
    if (tickerTrack) {
        const tickerHTML = tickerItems.map(t =>
            `<span class="ticker-item">${t}</span><span class="ticker-sep">/</span>`
        ).join('');
        tickerTrack.innerHTML = tickerHTML + tickerHTML;
    }

    // ── Scroll-reveal statement ──
    const revealSentence = "We work with US service businesses ready to stop losing leads. We rebuild their website in 48 hours, close on a live video call, and hand it over live. When the job is done, the result is online and making money — not just sitting in a Figma file.";
    const revealContainer = document.getElementById('reveal-text');
    if (revealContainer) {
        const revealWords = revealSentence.split(' ');
        revealWords.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = (i === 0 ? '' : ' ') + word;
            revealContainer.appendChild(span);
        });

        const allWords = revealContainer.querySelectorAll('.word');

        function onRevealScroll() {
            const rect = revealContainer.getBoundingClientRect();
            const windowH = window.innerHeight;
            const progress = Math.min(1, Math.max(0,
                (windowH * 0.88 - rect.top) / (windowH * 0.78 - windowH * 0.1 + rect.height)
            ));
            const litCount = Math.floor(progress * allWords.length);
            allWords.forEach((w, i) => {
                w.classList.toggle('lit', i < litCount);
            });
        }

        window.addEventListener('scroll', onRevealScroll);
        onRevealScroll();
    }
});
