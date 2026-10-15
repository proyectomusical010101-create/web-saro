/**
 * SARO MOTORS & SERVICES - Interactive Logic
 * Controls dynamic hero banner slider, stats counters, tabs, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initStatsCounter();
  initInventoryTabs();
  initSmoothScroll();
  initTiltEffect();
  initScrollReveal();
});

/* ================= 1. HERO BANNER SLIDER (PBM STYLE) ================= */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.indicator-dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  
  if (!slides.length) return;
  
  let currentSlide = 0;
  const slideCount = slides.length;
  let autoplayTimer = null;
  const slideDuration = 4000; // 4 segundos exactos por slide

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    currentSlide = (index + slideCount) % slideCount;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoplay();
    });
  });

  startAutoplay();
}

/* ================= 2. NUMERIC STATS TICKER ================= */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target') || '0', 10);
          const prefix = stat.getAttribute('data-prefix') || '';
          const suffix = stat.getAttribute('data-suffix') || '';
          
          let count = 0;
          const duration = 2000;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = Math.ceil(target / steps);

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              count = target;
              clearInterval(timer);
            }
            stat.innerHTML = `${prefix}${count.toLocaleString()}${suffix ? `<span>${suffix}</span>` : ''}`;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) observer.observe(statsSection);
}

/* ================= 3. INVENTORY TABS ================= */
function initInventoryTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const bikeCards = document.querySelectorAll('.bike-card');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      bikeCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ================= 4. SMOOTH SCROLL ================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ================= 5. INTERACTIVE 3D TILT & GLARE EFFECT ================= */
function initTiltEffect() {
  const cards = document.querySelectorAll('.bike-card, .brand-card, .service-card-num, .pillar-card');
  
  cards.forEach(card => {
    card.classList.add('tilt-card');
    
    // Create glare layer if not present
    let glare = card.querySelector('.tilt-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
    }
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg
      const rotateY = ((x - centerX) / centerX) * 7;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      
      // Update glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.28) 0%, transparent 65%)`;
      glare.style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      glare.style.opacity = '0';
    });
  });
}

/* ================= 6. SCROLL REVEAL ANIMATION ================= */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.section-header, .pillar-card, .brand-card, .bike-card, .service-card-num, .about-card-modern, .financing-banner, .booking-card');
  
  revealElements.forEach(el => {
    el.classList.add('reveal-on-scroll');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
