/** 
 * Nút đêm sáng
 */
const darkmodeBtn = document.getElementById('darkmode-toggle');
const modeIcon = document.getElementById('mode-icon');

darkmodeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    modeIcon.src = newTheme === 'dark' ? 'assets/img/moon.png' : 'assets/img/sun.png';

    // Simple pulse animation on click
    darkmodeBtn.style.transform = 'scale(0.9)';
    setTimeout(() => darkmodeBtn.style.transform = 'scale(1.1)', 100);
});

/** 
 * Nút đôi ngôn ngữ
 */
const langBtn = document.getElementById('lang-toggle');
const langIcon = document.getElementById('lang-icon');
let currentLang = 'vi';

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    langIcon.src = currentLang === 'vi' ? 'assets/img/vn-flag.png' : 'assets/img/en-flag.png';
    document.documentElement.setAttribute('lang', currentLang);

    // Cập nhật tất cả các phần tử có thuộc tính data-vi/en (bao gồm cả Hero)
    document.querySelectorAll('[data-vi]').forEach(el => {
        el.innerHTML = el.getAttribute(`data-${currentLang}`);
    });

    updateTypography();
});

/** 
 * Xử lý style chữ (8-Bit vs Normal)
 */
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

    // 1. Cập nhật Font và Ảnh đại diện
    if (is8bit) {
        document.body.classList.add('pixel-font');
        if (navAvatar) navAvatar.src = 'assets/img/avatar-pixel.jpg';
        if (aboutAvatar) aboutAvatar.src = 'assets/img/avatar-pixel.jpg';
    } else {
        document.body.classList.remove('pixel-font');
        if (navAvatar) navAvatar.src = 'assets/img/avatar.jpg';
        if (aboutAvatar) aboutAvatar.src = 'assets/img/avatar.jpg';
    }

    // 2. Tiêu đề hiệu ứng đặc biệt (Saria + Gradient) khi ở chế độ 8-bit Tiếng Việt
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

/**
 * Bộ lọc dự án (Project Filtering)
 */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Cập nhật nút active
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'flex';
                // Animation nhẹ khi hiện
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transition = 'opacity 0.4s ease';
                }, 10);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

styleToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('pixel-style');
    updateTypography();

    styleToggleBtn.style.transform = 'scale(0.8) rotate(-10deg)';
    setTimeout(() => styleToggleBtn.style.transform = '', 200);
});

/** 
 * Sự kiện nhân vật
 */
const mascot = document.getElementById('mascot');
const navContainer = document.querySelector('.nav-container');

if (mascot) {
    mascot.addEventListener('click', () => {
        // Ẩn nhân vật
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

/**
 * Hiệu ứng thanh kỹ năng (Skill Bars)
 */
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