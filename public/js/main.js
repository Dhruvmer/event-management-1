/* ============================================
   EVENTPRO - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ---- Auto-dismiss Alerts ----
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    }, 5000);
  });

  // ---- Password Strength Indicator ----
  const passwordInput = document.getElementById('password');
  const strengthBar = document.getElementById('passwordStrength');
  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', function () {
      const val = this.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++;
      if (/\d/.test(val)) strength++;
      if (/[@$!%*?&#]/.test(val)) strength++;

      const colors = ['#dc3545', '#ffc107', '#fd7e14', '#28a745'];
      const widths = ['25%', '50%', '75%', '100%'];
      const labels = ['Weak', 'Fair', 'Good', 'Strong'];

      strengthBar.style.width = widths[strength - 1] || '0%';
      strengthBar.style.background = colors[strength - 1] || '#eee';
      strengthBar.style.height = '4px';
      strengthBar.title = labels[strength - 1] || '';
    });
  }

  // ---- Form Validation ----
  const forms = document.querySelectorAll('form[novalidate]');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });

  // ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- File Upload Preview ----
  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert('File size exceeds 5MB limit. Please choose a smaller file.');
          this.value = '';
          return;
        }
        // Show file name
        const label = this.nextElementSibling;
        if (label && label.classList.contains('custom-file-label')) {
          label.textContent = file.name;
        }
      }
    });
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target')) || 0;
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + '+';
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + '+';
        }
      }, 16);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  // ---- Animate On Scroll ----
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  if (animateElements.length > 0) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = (entry.target.dataset.delay || 0) + 's';
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          entry.target.style.opacity = '1';
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animateElements.forEach(el => animObserver.observe(el));
  }

  // ---- Package Selection Update Summary ----
  const packageRadios = document.querySelectorAll('input[name="selectedPackage"]');
  packageRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      const label = this.closest('.package-card').querySelector('h5.text-primary');
      if (label) {
        const priceText = label.textContent.replace('₹', '').replace(/,/g, '');
        const price = parseFloat(priceText) || 0;
        const tax = Math.round(price * 0.18);
        const total = price + tax;

        const summaryPrice = document.getElementById('summaryPrice');
        const summaryTax = document.getElementById('summaryTax');
        const summaryTotal = document.getElementById('summaryTotal');

        if (summaryPrice) summaryPrice.textContent = '₹' + price.toLocaleString('en-IN');
        if (summaryTax) summaryTax.textContent = '₹' + tax.toLocaleString('en-IN');
        if (summaryTotal) summaryTotal.textContent = '₹' + total.toLocaleString('en-IN');
      }
    });
  });

  // ---- Back to Top Button ----
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.className = 'btn btn-primary rounded-circle shadow-lg';
  backToTop.style.cssText = 'position:fixed;bottom:30px;right:30px;z-index:999;width:45px;height:45px;display:none;align-items:center;justify-content:center;';
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Confirm Delete Actions ----
  document.querySelectorAll('[data-confirm]').forEach(el => {
    el.addEventListener('click', function (e) {
      if (!confirm(this.dataset.confirm || 'Are you sure?')) {
        e.preventDefault();
      }
    });
  });

  console.log('🎉 EventPro loaded successfully!');
});
