document.addEventListener('DOMContentLoaded', () => {
  // --- Load Clinic Settings & Reviews from SQLite Backend ---
  
  // Load Settings
  fetch('/api/dr_shalini/settings')
    .then(response => response.json())
    .then(settings => {
      const phoneEl = document.getElementById('clinic-phone');
      const phoneFooterEl = document.getElementById('clinic-phone-footer');
      const addressEl = document.getElementById('clinic-address');
      const addressFooterEl = document.getElementById('clinic-address-footer');
      const hoursEl = document.getElementById('clinic-hours');

      if (phoneEl) phoneEl.textContent = settings.phone || '+91 9657009264';
      if (phoneFooterEl) phoneFooterEl.textContent = settings.phone || '+91 9657009264';
      if (addressEl) addressEl.textContent = settings.address || 'Flat 101, 1st Floor, HM Enclave, Yadav Nagar, Nagpur';
      if (addressFooterEl) addressFooterEl.textContent = settings.address || 'Flat 101, 1st Floor, HM Enclave, Yadav Nagar, Nagpur';
      if (hoursEl) hoursEl.textContent = settings.hours || 'Mon - Sat: 10:00 AM - 8:30 PM';
    })
    .catch(err => console.error('Failed to load clinic settings from server:', err));

  // Load and Render Testimonials
  const slider = document.getElementById('testimonial-slider');
  const dotsContainer = document.getElementById('slider-dots');

  function loadReviews() {
    fetch('/api/dr_shalini/reviews')
      .then(response => response.json())
      .then(reviews => {
        if (!slider || !dotsContainer) return;
        
        slider.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        if (reviews.length === 0) {
          slider.innerHTML = '<div style="color: var(--text-light); text-align: center; width: 100%;">No reviews added yet.</div>';
          return;
        }

        reviews.forEach((review, idx) => {
          // Create slide HTML
          const slide = document.createElement('div');
          slide.className = `testimonial-slide ${idx === 0 ? 'active' : ''}`;
          
          let starsHtml = '';
          for (let i = 0; i < review.rating; i++) {
            starsHtml += '<i class="fa-solid fa-star"></i>';
          }
          
          slide.innerHTML = `
            <div class="stars">${starsHtml}</div>
            <p class="quote">"${review.quote}"</p>
            <div class="patient-info">
              <div class="patient-avatar">${review.avatar || review.name.charAt(0)}</div>
              <div>
                <h4>${review.name}</h4>
                <span>${review.meta}</span>
              </div>
            </div>
          `;
          slider.appendChild(slide);
          
          // Create dot
          const dot = document.createElement('span');
          dot.className = `dot ${idx === 0 ? 'active' : ''}`;
          dotsContainer.appendChild(dot);
        });

        // Initialize testimonial slider transitions
        initTestimonialSlider();
      })
      .catch(err => console.error('Failed to load testimonials from server:', err));
  }

  loadReviews();

  // --- Header Scroll Effect ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveLink();
  });

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });

    // Close menu when clicking links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
      });
    });
  }

  // --- Active Nav Link Highlighting ---
  function highlightActiveLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  }

  // --- Testimonial Slider Functionality ---
  let autoSlideInterval;
  function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    const dots = dotsContainer.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
      if (index >= slides.length) currentSlide = 0;
      else if (index < 0) currentSlide = slides.length - 1;
      else currentSlide = index;
      
      slides.forEach((slide, idx) => {
        slide.classList.remove('active');
        if (idx === currentSlide) {
          slide.classList.add('active');
        }
      });
      
      dots.forEach((dot, idx) => {
        dot.classList.remove('active');
        if (idx === currentSlide) {
          dot.classList.add('active');
        }
      });
    }
    
    // Controls click handlers
    if (nextBtn) {
      nextBtn.replaceWith(nextBtn.cloneNode(true));
      document.getElementById('next-testimonial').addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetInterval();
      });
    }
    if (prevBtn) {
      prevBtn.replaceWith(prevBtn.cloneNode(true));
      document.getElementById('prev-testimonial').addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetInterval();
      });
    }
    
    // Dots click handlers
    dots.forEach((dot, idx) => {
      dot.replaceWith(dot.cloneNode(true));
    });
    
    // Get fresh references after replacing nodes to prevent dead listeners
    const freshDots = dotsContainer.querySelectorAll('.dot');
    freshDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        resetInterval();
      });
    });
    
    // Auto slide change
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
    
    const resetInterval = () => {
      clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000);
    };
  }

  // --- Appointment Booking Form ---
  const appointmentForm = document.getElementById('appointmentForm');
  const formMessage = document.getElementById('form-message');
  
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get field values
      const name = document.getElementById('fullname').value;
      const phone = document.getElementById('phone').value;
      const treatmentSelect = document.getElementById('treatment');
      const treatment = treatmentSelect.options[treatmentSelect.selectedIndex].text;
      const date = document.getElementById('date').value;
      const timeSelect = document.getElementById('time');
      const time = timeSelect.options[timeSelect.selectedIndex].text;
      const notes = document.getElementById('notes').value;
      
      // Show loader on the button
      const submitBtn = appointmentForm.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;
      
      // Post Booking to SQLite Backend
      const bookingData = {
        id: 'B-' + Date.now(),
        name,
        phone,
        treatment,
        date,
        time,
        notes,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      fetch('/api/dr_shalini/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })
      .then(response => response.json())
      .then(result => {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
          // Show success message
          formMessage.className = 'form-message success';
          formMessage.innerHTML = `
            <strong>Thank you, ${name}!</strong><br>
            Your request for <strong>${treatment}</strong> on <strong>${date}</strong> has been received. 
            We'll call you at <strong>${phone}</strong> shortly to confirm.
          `;
          
          // Reset form
          appointmentForm.reset();
        } else {
          formMessage.className = 'form-message error';
          formMessage.innerHTML = `<strong>Error:</strong> Failed to schedule appointment. Please try again.`;
        }
        
        formMessage.style.display = 'block';
        
        // Hide message after 8 seconds
        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 8000);
      })
      .catch(err => {
        console.error('Booking submission failed:', err);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        formMessage.className = 'form-message error';
        formMessage.innerHTML = `<strong>Error:</strong> Connection failed. Please check your network.`;
        formMessage.style.display = 'block';
      });
    });
  }
});
