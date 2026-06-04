// FRC 10034 Gammaland - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App Data
  let appData = window.getGammalandData();

  // DOM Elements
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navItems = document.querySelectorAll('.nav-item');
  const pageSections = document.querySelectorAll('.page-section');
  const siteHeader = document.getElementById('site-header');

  // Roster Filters
  const teamFiltersContainer = document.getElementById('team-filters');
  const teamGrid = document.getElementById('team-members-grid');

  // Lightbox Modal
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxTitleText = document.getElementById('lightbox-title-text');
  const lightboxDescText = document.getElementById('lightbox-desc-text');

  // ==========================================
  // 1. ROUTER & NAVIGATION
  // ==========================================

  // Toggle Mobile Menu
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Router function based on URL hash
  function handleRouting() {
    let hash = window.location.hash || '#home';
    
    // Close mobile menu if open
    if (navMenu) navMenu.classList.remove('active');
    if (navToggle) navToggle.classList.remove('active');

    // Remove active class from all nav items
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === hash) {
        item.classList.add('active');
      }
    });

    // Hide all sections, show active section
    const targetId = `page-${hash.replace('#', '')}`;
    let sectionFound = false;

    pageSections.forEach(section => {
      if (section.id === targetId) {
        section.style.display = 'block';
        sectionFound = true;
        
        // Trigger page-specific animations or load updates
        if (hash === '#home') buildHomePage();
        else if (hash === '#about') buildAboutPage();
        else if (hash === '#robot') buildRobotPage();
        else if (hash === '#gallery') buildGalleryPage();
        else if (hash === '#admin') {
          // If admin page, trigger admin-specific init if it exists
          if (typeof window.initAdminPanel === 'function') {
            window.initAdminPanel();
          }
        }
      } else {
        section.style.display = 'none';
      }
    });

    // Fallback to Home if section doesn't exist
    if (!sectionFound && pageSections.length > 0) {
      window.location.hash = '#home';
    }

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Listen to hash changes and initial load
  window.addEventListener('hashchange', handleRouting);
  
  // Navbar scroll visual effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });


  // ==========================================
  // 2. PAGE BUILDERS
  // ==========================================

  // Populate Shared elements (Footer, Brand titles, etc.)
  function populateSharedElements() {
    appData = window.getGammalandData();
    const info = appData.teamInfo;

    // Head Info
    document.title = `FRC ${info.number} ${info.name} | 官方網站`;

    // Hero section text
    const heroTitle = document.getElementById('hero-title');
    const heroMotto = document.getElementById('hero-motto');
    const heroTeamNum = document.getElementById('hero-team-num');
    
    if (heroTitle) heroTitle.textContent = info.name;
    if (heroMotto) heroMotto.textContent = info.motto;
    if (heroTeamNum) heroTeamNum.textContent = `FRC TEAM #${info.number}`;

    // Footer Info
    const footerMotto = document.getElementById('footer-motto-text');
    const footerCopyright = document.getElementById('footer-copyright');
    
    if (footerMotto) footerMotto.textContent = info.motto;
    if (footerCopyright) footerCopyright.innerHTML = `&copy; ${new Date().getFullYear()} FRC Team ${info.number} ${info.name}. All rights reserved.`;

    // Social Links
    const igLink = document.getElementById('footer-social-instagram');
    const ghLink = document.getElementById('footer-social-github');
    const emailLink = document.getElementById('footer-social-email');

    if (igLink) igLink.href = info.socialLinks.instagram || '#';
    if (ghLink) ghLink.href = info.socialLinks.github || '#';
    if (emailLink) emailLink.href = info.socialLinks.email ? `mailto:${info.socialLinks.email}` : '#';
  }

  // HOME PAGE
  function buildHomePage() {
    populateSharedElements();
    
    // Build News Section
    const newsGrid = document.getElementById('home-news-grid');
    if (newsGrid) {
      newsGrid.innerHTML = '';
      
      if (!appData.news || appData.news.length === 0) {
        newsGrid.innerHTML = '<div class="glass-card"><p>目前暫無最新公告。</p></div>';
      } else {
        // Sort news by date descending
        const sortedNews = [...appData.news].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedNews.forEach(item => {
          const card = document.createElement('div');
          card.className = 'glass-card news-card';
          card.innerHTML = `
            <span class="news-date">${item.date}</span>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.summary)}</p>
            <a href="#news-${item.id}" class="news-more-btn" data-news-id="${item.id}">閱讀更多 →</a>
          `;
          newsGrid.appendChild(card);
        });

        // Set up news click listeners for simple alerts
        newsGrid.querySelectorAll('.news-more-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const newsId = btn.getAttribute('data-news-id');
            const newsItem = appData.news.find(n => n.id === newsId);
            if (newsItem) {
              alert(`【${newsItem.title}】\n發布日期：${newsItem.date}\n\n${newsItem.content}`);
            }
          });
        });
      }
    }

    // Build Sponsors Section
    const sponsorsContainer = document.getElementById('home-sponsors-container');
    if (sponsorsContainer) {
      sponsorsContainer.innerHTML = '';
      
      const tiers = [
        { key: 'diamond', label: '鑽石級贊助商 (Diamond Sponsors)' },
        { key: 'gold', label: '黃金級贊助商 (Gold Sponsors)' },
        { key: 'silver', label: '白銀級贊助商 (Silver Sponsors)' },
        { key: 'bronze', label: '青銅級與支持夥伴 (Bronze Sponsors)' }
      ];

      tiers.forEach(tier => {
        const tierSponsors = appData.sponsors.filter(s => s.tier === tier.key);
        if (tierSponsors.length > 0) {
          const tierDiv = document.createElement('div');
          tierDiv.className = `sponsor-tier-section tier-${tier.key}`;
          
          let cardsHtml = '';
          tierSponsors.forEach(sponsor => {
            cardsHtml += `
              <a href="${sponsor.link || '#'}" target="_blank" class="sponsor-card" title="${escapeHTML(sponsor.name)}">
                <span class="sponsor-logo-text">${escapeHTML(sponsor.logo || sponsor.name)}</span>
              </a>
            `;
          });

          tierDiv.innerHTML = `
            <h3 class="sponsor-tier-title">${tier.label}</h3>
            <div class="sponsors-grid">
              ${cardsHtml}
            </div>
          `;
          sponsorsContainer.appendChild(tierDiv);
        }
      });

      if (appData.sponsors.length === 0) {
        sponsorsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">正在招募贊助夥伴中！歡迎與我們聯絡。</p>';
      }
    }
  }

  // ABOUT PAGE
  function buildAboutPage() {
    populateSharedElements();
    
    // Set text descriptions and statistics
    const aboutDescText = document.getElementById('about-description-text');
    const statFounded = document.getElementById('stat-founded');
    const statMembers = document.getElementById('stat-members');
    const statSponsors = document.getElementById('stat-sponsors');

    if (aboutDescText) aboutDescText.textContent = appData.teamInfo.aboutText;
    if (statFounded) statFounded.textContent = appData.teamInfo.foundedYear;
    if (statMembers) statMembers.textContent = `${appData.teamMembers.length}+`;
    if (statSponsors) statSponsors.textContent = `${appData.sponsors.length}+`;

    // Initialize Member Filters
    if (teamFiltersContainer) {
      const filterBtns = teamFiltersContainer.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
        btn.onclick = () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filterValue = btn.getAttribute('data-filter');
          renderMembers(filterValue);
        };
      });
    }

    // Initial render of all members
    renderMembers('all');
  }

  // Renders member cards in the About Grid
  function renderMembers(filter) {
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    const members = appData.teamMembers;
    const filteredMembers = filter === 'all' 
      ? members 
      : members.filter(m => m.subteam === filter);

    if (filteredMembers.length === 0) {
      teamGrid.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; text-align: center;"><p>此組別目前尚無團員資料。</p></div>';
      return;
    }

    filteredMembers.forEach(mem => {
      const card = document.createElement('div');
      card.className = 'glass-card team-member-card';
      
      // Default SVG avatar if no image provided
      const avatarHtml = mem.image 
        ? `<img src="${mem.image}" alt="${escapeHTML(mem.name)}">`
        : `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

      card.innerHTML = `
        <div class="member-avatar-wrapper">
          <div class="member-avatar">
            ${avatarHtml}
          </div>
        </div>
        <h3 class="member-name">${escapeHTML(mem.name)}</h3>
        <span class="member-role">${escapeHTML(mem.role)}</span>
        <p class="member-bio">${escapeHTML(mem.bio)}</p>
      `;
      teamGrid.appendChild(card);
    });
  }

  // ROBOT PAGE
  function buildRobotPage() {
    populateSharedElements();

    const robotSpecs = appData.robotSpecs;
    
    // DOM Elements
    const specName = document.getElementById('robot-spec-name');
    const specYear = document.getElementById('robot-spec-year');
    const specDesc = document.getElementById('robot-spec-desc');
    const specCadLink = document.getElementById('robot-cad-link');
    const specCodeLink = document.getElementById('robot-code-link');
    const specsList = document.getElementById('robot-specs-list');

    if (specName) specName.textContent = robotSpecs.name;
    if (specYear) specYear.textContent = robotSpecs.year;
    if (specDesc) specDesc.textContent = robotSpecs.description;
    
    if (specCadLink) {
      specCadLink.href = robotSpecs.cadLink || '#';
      specCadLink.style.display = robotSpecs.cadLink ? 'inline-flex' : 'none';
    }
    if (specCodeLink) {
      specCodeLink.href = robotSpecs.codeLink || '#';
      specCodeLink.style.display = robotSpecs.codeLink ? 'inline-flex' : 'none';
    }

    // Render specification fields
    if (specsList) {
      specsList.innerHTML = '';
      if (robotSpecs.details && robotSpecs.details.length > 0) {
        robotSpecs.details.forEach(spec => {
          if (spec.label && spec.value) {
            const row = document.createElement('div');
            row.className = 'spec-row';
            row.innerHTML = `
              <div class="spec-label">${escapeHTML(spec.label)}</div>
              <div class="spec-value">${escapeHTML(spec.value)}</div>
            `;
            specsList.appendChild(row);
          }
        });
      }
    }
  }

  // GALLERY PAGE
  function buildGalleryPage() {
    populateSharedElements();

    const galleryGrid = document.getElementById('gallery-items-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';
    
    if (!appData.gallery || appData.gallery.length === 0) {
      galleryGrid.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; text-align: center;"><p>目前尚無相片上傳。</p></div>';
      return;
    }

    appData.gallery.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.innerHTML = `
        <div class="gallery-placeholder-img">
          <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          <span>${escapeHTML(item.title)}</span>
        </div>
        <div class="gallery-overlay">
          <h3 class="gallery-item-title">${escapeHTML(item.title)}</h3>
          <p class="gallery-item-desc">${escapeHTML(item.description || '')}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(item);
      });

      galleryGrid.appendChild(card);
    });
  }

  // ==========================================
  // 3. LIGHTBOX INTERACTIVITY
  // ==========================================
  function openLightbox(item) {
    if (!lightboxModal) return;
    
    lightboxTitleText.textContent = item.title;
    lightboxDescText.textContent = item.description || '';
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  if (lightboxCloseBtn) lightboxCloseBtn.onclick = closeLightbox;
  if (lightboxModal) {
    lightboxModal.onclick = (e) => {
      if (e.target === lightboxModal) closeLightbox();
    };
  }


  // ==========================================
  // 4. HELPER UTILS
  // ==========================================
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Exposed rebuilders globally for use by admin.js
  window.rebuildWebsiteViews = function() {
    appData = window.getGammalandData();
    populateSharedElements();
    buildHomePage();
    buildAboutPage();
    buildRobotPage();
    buildGalleryPage();
  };

  // Initial Routing trigger
  handleRouting();
});
