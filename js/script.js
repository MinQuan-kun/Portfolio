const darkmodeBtn = document.getElementById('darkmode-toggle');
const modeIcon = document.getElementById('mode-icon');

darkmodeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    modeIcon.src = newTheme === 'dark' ? 'assets/img/moon.png' : 'assets/img/sun.png';

    darkmodeBtn.style.transform = 'scale(0.9)';
    setTimeout(() => darkmodeBtn.style.transform = 'scale(1.1)', 100);

    updateBackgroundEffects();

    initPixelTransitions();
});


const langBtn = document.getElementById('lang-toggle');
const langIcon = document.getElementById('lang-icon');
let currentLang = 'vi';

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    langIcon.src = currentLang === 'vi' ? 'assets/img/vn-flag.png' : 'assets/img/en-flag.png';
    document.documentElement.setAttribute('lang', currentLang);

    document.querySelectorAll('[data-vi]').forEach(el => {
        if (el.id !== 'hero-intro' && el.id !== 'hero-sub') {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
        }
    });

    updateTypography();
    restartHeroTyping(currentLang);
});

const styleToggleBtn = document.getElementById('style-toggle-btn');

function updateTypography() {
    const is8bit = document.body.classList.contains('pixel-style');
    const isVi = document.documentElement.getAttribute('lang') === 'vi';

    const navAvatar = document.getElementById('nav-avatar');
    const aboutAvatar = document.getElementById('about-avatar');
    const heroSub = document.getElementById('hero-sub');
    const aboutTitle = document.getElementById('about-title');
    const skillsTitle = document.getElementById('skills-title');
    const nameHighlight = document.getElementById('name-highlight');
    const projectsTitle = document.getElementById('projects-title');
    const achievementsTitle = document.getElementById('achievements-title');
    const contactTitle = document.getElementById('contact-title');

    if (is8bit) {
        document.body.classList.add('pixel-font');
        if (navAvatar) navAvatar.src = 'assets/img/avatar-pixel.jpg';
        if (aboutAvatar) aboutAvatar.src = 'assets/img/avatar-pixel.jpg';
    } else {
        document.body.classList.remove('pixel-font');
        if (navAvatar) navAvatar.src = 'assets/img/avatar.jpg';
        if (aboutAvatar) aboutAvatar.src = 'assets/img/avatar.jpg';
    }

    const elementsToFix = [heroSub, aboutTitle, skillsTitle, nameHighlight, projectsTitle, achievementsTitle, contactTitle];
    elementsToFix.forEach(el => {
        if (el) {
            if (is8bit && isVi) {
                el.classList.add('saria-mode-text');
            } else {
                el.classList.remove('saria-mode-text');
            }
        }
    });
}

const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

function filterProjects(filterValue) {
    projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const isFeatured = card.getAttribute('data-featured') === 'true';

        let shouldShow = false;
        if (filterValue === 'all') {
            shouldShow = isFeatured;
        } else {
            shouldShow = (category === filterValue);
        }

        if (shouldShow) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transition = 'opacity 0.4s ease';
            }, 10);
        } else {
            card.style.display = 'none';
        }
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        filterProjects(filterValue);
    });
});

filterProjects('all');

styleToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('pixel-style');
    updateTypography();

    styleToggleBtn.style.transform = 'scale(0.8) rotate(-10deg)';
    setTimeout(() => styleToggleBtn.style.transform = '', 200);

    updateBackgroundEffects();

    initPixelTransitions();
});

const mascot = document.getElementById('mascot');
const navContainer = document.querySelector('.nav-container');

if (mascot) {
    mascot.addEventListener('click', () => {
        mascot.style.opacity = '0';
        mascot.style.pointerEvents = 'none';

        setTimeout(() => {
            const containerWidth = navContainer.offsetWidth;
            const containerHeight = navContainer.offsetHeight;

            const randomX = Math.floor(Math.random() * (containerWidth - 100)) + 20;

            mascot.style.position = 'absolute';
            mascot.style.left = `${randomX}px`;
            mascot.style.top = '50%';
            mascot.style.transform = 'translateY(-50%)';

            mascot.style.opacity = '1';
            mascot.style.pointerEvents = 'auto';

            mascot.animate([
                { transform: 'translateY(-50%) scale(0)' },
                { transform: 'translateY(-50%) scale(1.2)' },
                { transform: 'translateY(-50%) scale(1)' }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
        }, 2000);
    });
}

const skillSection = document.querySelector('.skills-section');
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            skillFills.forEach(fill => {
                const targetWidth = fill.style.width;
                fill.style.width = '0';
                setTimeout(() => {
                    fill.style.width = targetWidth;
                }, 100);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

if (skillSection) {
    skillObserver.observe(skillSection);
}

let heroIntroType = null;
let heroNameType = null;
let heroSubType = null;
let heroRerunTimeout = null;

function destroyHeroTyping() {
    if (heroIntroType) { heroIntroType.destroy(); heroIntroType = null; }
    if (heroNameType) { heroNameType.destroy(); heroNameType = null; }
    if (heroSubType) { heroSubType.destroy(); heroSubType = null; }
    if (heroRerunTimeout) { clearTimeout(heroRerunTimeout); heroRerunTimeout = null; }
}

function startHeroTyping(lang) {
    destroyHeroTyping();
    
    const introEl = document.querySelector('.hero-intro');
    const nameEl = document.querySelector('.hero-title .gradient');
    const subEl = document.querySelector('.hero-sub');
    
    if (!introEl || !nameEl || !subEl) return;
    
    introEl.innerHTML = '';
    nameEl.innerHTML = '';
    subEl.innerHTML = '';
    
    const introText = introEl.getAttribute(`data-${lang}`) || (lang === 'vi' ? 'Xin chào, tôi là' : "Hi, I'm");
    const nameText = "Minh Quân";
    const subText = subEl.getAttribute(`data-${lang}`) || (lang === 'vi' ? 'Hoặc bạn có thể gọi tôi là Ikkun' : 'Or you can call me Ikkun');
    
    heroIntroType = new TextType(introEl, {
        text: introText,
        typingSpeed: 50,
        loop: false,
        showCursor: true,
        cursorCharacter: '|',
        onSentenceComplete: () => {
            if (heroIntroType && heroIntroType._cursorSpan) {
                heroIntroType._cursorSpan.style.display = 'none';
            }
            
            heroNameType = new TextType(nameEl, {
                text: nameText,
                typingSpeed: 70,
                loop: false,
                showCursor: true,
                cursorCharacter: '|',
                onSentenceComplete: () => {
                    if (heroNameType && heroNameType._cursorSpan) {
                        heroNameType._cursorSpan.style.display = 'none';
                    }
                    
                    heroSubType = new TextType(subEl, {
                        text: subText,
                        typingSpeed: 35,
                        loop: false,
                        showCursor: true,
                        cursorCharacter: '|',
                        onSentenceComplete: () => {
                            heroRerunTimeout = setTimeout(() => {
                                startHeroTyping(lang);
                            }, 10000);
                        }
                    });
                }
            });
        }
    });
}

function restartHeroTyping(lang) {
    destroyHeroTyping();
    startHeroTyping(lang);
}

let shapeGridInstance = null;

function updateShapeGridActive() {
    const canvasEl = document.getElementById('shapegrid-canvas');
    if (!canvasEl) return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const isGaming = document.body.classList.contains('pixel-style');

    if (isLight && !isGaming) {
        document.body.classList.add('shapegrid-active');
        if (!shapeGridInstance && typeof ShapeGrid !== 'undefined') {
            shapeGridInstance = new ShapeGrid(canvasEl, {
                squareSize: 45,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                hoverFillColor: 'rgba(0, 242, 255, 0.06)',
                speed: 0.3,
                hoverTrailAmount: 6,
                shape: 'hexagon'
            });
        } else if (shapeGridInstance) {
            shapeGridInstance.start();
        }
    } else {
        document.body.classList.remove('shapegrid-active');
        if (shapeGridInstance) {
            shapeGridInstance.stop();
        }
    }
}

function updatePixelSnowActive() {
    const containerEl = document.getElementById('pixelsnow-container');
    if (!containerEl) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const isGaming = document.body.classList.contains('pixel-style');

    if (isDark && !isGaming) {
        document.body.classList.add('pixelsnow-active');

        if (!window._pixelSnowInstance && typeof window.PixelSnow !== 'undefined') {
            window._pixelSnowInstance = new window.PixelSnow(containerEl, {
                color: '#ffffff',
                flakeSize: 0.012,
                minFlakeSize: 1.5,
                pixelResolution: 200,
                speed: 1.25,
                depthFade: 8,
                farPlane: 20,
                brightness: 1,
                gamma: 0.4545,
                density: 0.3,
                variant: 'square',
                direction: 125
            });
        } else if (window._pixelSnowInstance) {
            window._pixelSnowInstance.start();
        }
    } else {
        document.body.classList.remove('pixelsnow-active');
        if (window._pixelSnowInstance) {
            window._pixelSnowInstance.stop();
        }
    }
}

function updateBackgroundEffects() {
    updateShapeGridActive();
    updatePixelSnowActive();
}


function initInteractiveEffects() {
    // 1. TargetCursor hoạt động liên tục trên mọi chế độ
    if (typeof TargetCursor !== 'undefined' && !window._targetCursor) {
        window._targetCursor = new TargetCursor({
            targetSelector: 'a, button, .btn, .btn-icon, .contact-btn, .btn-cert-view, .filter-btn, #mascot',
            cursorColor: '#ffffff',
            hoverDuration: 0.25
        });
        window._targetCursor.enable();
    }

    if (typeof SpotlightCard !== 'undefined') {
        document.querySelectorAll('.skill-category-card, .project-card, .discord-card-container, .contact-card-container, .certificate-card').forEach(card => {
            new SpotlightCard(card);
        });
    }

    startHeroTyping(currentLang);

    const techGrid = document.querySelector('.technologies-grid');
    if (techGrid && typeof LogoLoop !== 'undefined') {
        const items = Array.from(techGrid.querySelectorAll('.tech-item'));
        const logos = items.map(item => {
            const iconEl = item.querySelector('i');
            const spanEl = item.querySelector('span');
            const html = iconEl ? iconEl.outerHTML : '';
            const title = spanEl ? spanEl.textContent : '';
            return { html: `${html} <span>${title}</span>`, title: title };
        });
        
        // Chia đôi danh sách logo
        const half = Math.ceil(logos.length / 2);
        const logos1 = logos.slice(0, half);
        const logos2 = logos.slice(half);
        
        // Tạo hai hàng div trống
        techGrid.innerHTML = '';
        const row1 = document.createElement('div');
        row1.className = 'tech-loop-row tech-loop-row-1';
        const row2 = document.createElement('div');
        row2.className = 'tech-loop-row tech-loop-row-2';
        techGrid.appendChild(row1);
        techGrid.appendChild(row2);
        
        techGrid.classList.add('logoloop-initialized');
        
        // Khởi tạo hàng thứ nhất chạy sang bên trái
        window._logoLoopInstance1 = new LogoLoop(row1, logos1, {
            speed: 50,
            gap: 40,
            logoHeight: 50,
            scaleOnHover: true,
            fadeOut: false,
            direction: 'left'
        });
        
        // Khởi tạo hàng thứ hai chạy sang bên phải
        window._logoLoopInstance2 = new LogoLoop(row2, logos2, {
            speed: 50,
            gap: 40,
            logoHeight: 50,
            scaleOnHover: true,
            fadeOut: false,
            direction: 'right'
        });
    }
}


/**
 * Unified Scroll Spy
 */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function scrollSpy() {
    const scrollPos = window.scrollY || window.pageYOffset;
    const navHeight = 90;

    // Toggle lớp .scrolled cho navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (scrollPos > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    let activeSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            activeSectionId = sectionId;
        }
    });

    if (scrollPos < 150) {
        activeSectionId = 'hero';
    }

    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        activeSectionId = 'contact';
    }

    if (activeSectionId) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeSectionId}`) {
                if (!link.classList.contains('active')) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
}

/**
 * Quản lý hiệu ứng PixelTransition cho thẻ dự án (Gaming Mode Only)
 */
let pixelTransitionInstances = [];

function destroyPixelTransitions() {
    pixelTransitionInstances.forEach(inst => {
        if (inst && typeof inst.destroy === 'function') {
            inst.destroy();
        }
    });
    pixelTransitionInstances = [];

    // Khôi phục lại HTML ban đầu của wrapper
    document.querySelectorAll('.project-card').forEach((card) => {
        const wrapper = card.querySelector('.project-image-wrapper');
        if (wrapper) {
            const origHtml = wrapper.getAttribute('data-original-html');
            if (origHtml) {
                wrapper.innerHTML = origHtml;
            }
        }
    });
}

function initPixelTransitions() {
    destroyPixelTransitions();

    const isGaming = document.body.classList.contains('pixel-style');
    if (!isGaming || typeof PixelTransition === 'undefined') return;

    document.querySelectorAll('.project-card').forEach((card) => {
        const wrapper = card.querySelector('.project-image-wrapper');
        if (wrapper) {
            const origHtml = wrapper.getAttribute('data-original-html');
            if (origHtml) {
                // Tạo thẻ DIV ảo để trích xuất cấu trúc HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = origHtml;

                const imgEl = tempDiv.querySelector('.project-img');
                const overlayEl = tempDiv.querySelector('.project-overlay');

                if (imgEl && overlayEl) {
                    const firstContent = imgEl.outerHTML;
                    const secondContent = overlayEl.outerHTML;
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

                    const pt = new PixelTransition(wrapper, {
                        firstContent: firstContent,
                        secondContent: secondContent,
                        gridSize: 8,
                        pixelColor: isDark ? '#020617' : '#f8fafc', // Tệp khớp màu nền gaming/pixel
                        animationStepDuration: 0.2,
                        aspectRatio: '62.5%', // Tương ứng tỉ lệ chiều cao 200px / rộng 320px
                        className: 'project-pixel-card'
                    });

                    pixelTransitionInstances.push(pt);
                }
            }
        }
    });
}

// Đăng ký các sự kiện tải trang
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        // Lưu trữ HTML gốc của ảnh dự án để phục hồi khi chuyển đổi chế độ
        document.querySelectorAll('.project-card').forEach((card) => {
            const wrapper = card.querySelector('.project-image-wrapper');
            if (wrapper && !wrapper.getAttribute('data-original-html')) {
                wrapper.setAttribute('data-original-html', wrapper.innerHTML);
            }
        });
        initInteractiveEffects();
        updateBackgroundEffects();
        initPixelTransitions();
    });
} else {
    document.querySelectorAll('.project-card').forEach((card) => {
        const wrapper = card.querySelector('.project-image-wrapper');
        if (wrapper && !wrapper.getAttribute('data-original-html')) {
            wrapper.setAttribute('data-original-html', wrapper.innerHTML);
        }
    });
    initInteractiveEffects();
    updateBackgroundEffects();
    initPixelTransitions();
}

window.addEventListener('scroll', scrollSpy);
window.addEventListener('resize', scrollSpy);
