class CourseManager {
    #observer = null;
    #options = { root: null, rootMargin: '200px', threshold: 0.1 };
  
    constructor() {
      this.courses = new Map();
      this.#init();
    }
  
    #init() {
      this.#setupCourseCards();
      this.#setupIntersectionObserver();
      this.#addEventListeners();
      this.#setupTabSwitching();
      // لم نعد نستخدم سلوك اختفاء الشريط عند التمرير
    }
  
    #setupCourseCards() {
      document.querySelectorAll('.course-card').forEach(card => {
        const header = card.querySelector('.course-header');
        const content = card.querySelector('.course-content');
        this.courses.set(card, { header, content });
        header.setAttribute('aria-expanded', 'false');
        content.hidden = true;
      });
    }
  
    #setupIntersectionObserver() {
      this.#observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const card = entry.target;
          card.style.viewTransitionName = entry.isIntersecting ? 'course-card' : 'none';
        });
      }, this.#options);
      this.courses.forEach((_, card) => this.#observer.observe(card));
    }
  
    #addEventListeners() {
      document.addEventListener('click', this.#handleClick.bind(this));
      document.addEventListener('keydown', this.#handleKey.bind(this));
  
      // Sidebar (burger) toggle and closing mechanism
      const hamburger = document.querySelector('.hamburger');
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.overlay');
      if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
          sidebar.classList.toggle('active');
          overlay.classList.toggle('active');
        });
      }
      // Close sidebar when clicking on any sidebar link
      document.querySelectorAll('.sidebar__link').forEach(link => {
        link.addEventListener('click', () => {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
        });
      });
      // Close sidebar or admin panel when clicking on overlay
      if (overlay) {
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          const adminPanel = document.querySelector('.admin-panel');
          if (adminPanel) adminPanel.classList.remove('active');
        });
      }
  
      // Admin panel toggle
      const adminToggle = document.getElementById('adminToggle');
      const adminPanel = document.querySelector('.admin-panel');
      const adminClose = document.querySelector('.admin-close');
      if (adminToggle && adminPanel) {
        adminToggle.addEventListener('click', e => {
          e.preventDefault();
          adminPanel.classList.add('active');
          overlay.classList.add('active');
        });
      }
      if (adminClose && adminPanel) {
        adminClose.addEventListener('click', () => {
          adminPanel.classList.remove('active');
          overlay.classList.remove('active');
        });
      }
    }
  
    #toggleCard(card) {
      const { header, content } = this.courses.get(card);
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', !isExpanded);
      content.hidden = isExpanded;
      // Toggle active class for visual effect
      card.classList.toggle('active', !isExpanded);
      if (!isExpanded) {
        this.#closeOtherCards(card);
        requestAnimationFrame(() => {
          content.style.maxHeight = `${content.scrollHeight}px`;
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      } else {
        content.style.maxHeight = '0';
      }
    }
  
    #closeOtherCards(currentCard) {
      this.courses.forEach((_, card) => {
        if (card !== currentCard && card.classList.contains('active')) {
          this.#toggleCard(card);
        }
      });
    }
  
    #handleClick(event) {
      const header = event.target.closest('.course-header');
      if (header) {
        event.preventDefault();
        const card = header.parentElement;
        this.#toggleCard(card);
      }
    }
  
    #handleKey(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        const header = event.target.closest('.course-header');
        if (header) {
          event.preventDefault();
          const card = header.parentElement;
          this.#toggleCard(card);
        }
      }
    }
  
    #setupTabSwitching() {
      // Setup tab switching for course tabs
      document.querySelectorAll('.course-tabs').forEach(tabsContainer => {
        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
          btn.addEventListener('click', event => {
            const parentContent = tabsContainer.closest('.course-content');
            const targetTabId = event.currentTarget.dataset.tab;
            // Remove active class from all tab buttons and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            parentContent.querySelectorAll('.tab-content').forEach(tabContent => {
              tabContent.classList.remove('active');
            });
            // Activate clicked tab and corresponding content
            event.currentTarget.classList.add('active');
            const targetContent = parentContent.querySelector(`#${targetTabId}`);
            if (targetContent) targetContent.classList.add('active');
          });
        });
      });
    }
  }
  
  // Initialize CourseManager when DOM is ready
  document.addEventListener('DOMContentLoaded', () => new CourseManager());
  