/* SOC Analyst Guide - Main JavaScript */
/* ===================================== */

document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initSidebarToggle();
  initCollapsibleSections();
  initTabs();
  initAccordions();
  initCopyButtons();
  initSearch();
  initScrollSpy();
  initMobileMenu();
});

/* ===================== */
/* SIDEBAR FUNCTIONALITY */
/* ===================== */

/* Initialize Sidebar - Mark Active Link */
function initSidebar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      
      // Expand parent section
      const section = link.closest('.nav-section');
      if (section) {
        section.classList.add('expanded');
      }
    }
  });
}

/* Sidebar Toggle (Show/Hide Entire Sidebar) */
function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  if (!toggleBtn || !sidebar) return;
  
  // Check localStorage for saved state
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    document.body.classList.add('sidebar-collapsed');
  }
  
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed);
  });
}

/* Collapsible Navigation Sections */
function initCollapsibleSections() {
  const sections = document.querySelectorAll('.nav-section');
  
  // Load saved states from localStorage
  const savedStates = JSON.parse(localStorage.getItem('navSectionStates') || '{}');
  
  sections.forEach((section, index) => {
    const title = section.querySelector('.nav-section-title');
    if (!title) return;
    
    // Make title clickable
    title.style.cursor = 'pointer';
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', 'false');
    
    // Add chevron icon if not present
    if (!title.querySelector('.section-chevron')) {
      const chevron = document.createElement('span');
      chevron.className = 'section-chevron';
      chevron.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      title.appendChild(chevron);
    }
    
    // Get section ID for localStorage
    const sectionId = title.textContent.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    // Check if section has active link or saved state
    const hasActiveLink = section.querySelector('.nav-link.active');
    const savedState = savedStates[sectionId];
    
    // Determine initial state
    if (hasActiveLink || savedState === 'expanded') {
      section.classList.add('expanded');
      title.setAttribute('aria-expanded', 'true');
    } else if (savedState === 'collapsed') {
      section.classList.remove('expanded');
    }
    
    // Toggle on click
    title.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = section.classList.toggle('expanded');
      title.setAttribute('aria-expanded', isExpanded);
      
      // Save state
      savedStates[sectionId] = isExpanded ? 'expanded' : 'collapsed';
      localStorage.setItem('navSectionStates', JSON.stringify(savedStates));
    });
    
    // Keyboard accessibility
    title.setAttribute('tabindex', '0');
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        title.click();
      }
    });
  });
}

/* =============== */
/* TAB COMPONENT   */
/* =============== */

function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs');
  
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        if (contents[index]) {
          contents[index].classList.add('active');
        }
      });
    });
    
    // Activate first tab by default
    if (buttons.length > 0 && !container.querySelector('.tab-btn.active')) {
      buttons[0].classList.add('active');
      if (contents[0]) contents[0].classList.add('active');
    }
  });
}

/* ==================== */
/* ACCORDION COMPONENT  */
/* ==================== */

function initAccordions() {
  const accordions = document.querySelectorAll('.accordion');
  
  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion-item');
    
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    });
  });
}

/* =================== */
/* COPY TO CLIPBOARD   */
/* =================== */

function initCopyButtons() {
  const codeBlocks = document.querySelectorAll('.code-block, .query-box');
  
  codeBlocks.forEach(block => {
    if (block.querySelector('.copy-btn')) return;
    
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
    btn.addEventListener('click', () => copyCode(block, btn));
    
    const header = block.querySelector('.query-header');
    if (header) {
      header.appendChild(btn);
    } else {
      block.style.position = 'relative';
      block.appendChild(btn);
    }
  });
  
  // Handle standalone pre elements
  const preBlocks = document.querySelectorAll('pre:not(.no-copy)');
  preBlocks.forEach(pre => {
    if (pre.closest('.code-block') || pre.closest('.query-box')) return;
    if (pre.querySelector('.copy-btn')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
    btn.addEventListener('click', () => copyCode(wrapper, btn));
    wrapper.appendChild(btn);
  });
}

function copyCode(block, btn) {
  const code = block.querySelector('code') || block.querySelector('pre');
  if (!code) return;
  
  const text = code.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    btn.textContent = 'Error';
  });
}

/* =================== */
/* SEARCH FUNCTIONALITY */
/* =================== */

function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;
  
  // Build search index from nav links
  const searchIndex = [];
  document.querySelectorAll('.nav-link').forEach(link => {
    const section = link.closest('.nav-section');
    const sectionTitle = section ? section.querySelector('.nav-section-title')?.textContent?.trim() || '' : '';
    searchIndex.push({
      title: link.textContent.trim(),
      url: link.getAttribute('href'),
      section: sectionTitle
    });
  });
  
  let resultsContainer = null;
  
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query)
    );
    
    displaySearchResults(results, query);
  }, 150));
  
  // Close results on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      hideSearchResults();
    }
  });
  
  function displaySearchResults(results, query) {
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'search-results';
      searchInput.parentNode.appendChild(resultsContainer);
    }
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
      resultsContainer.classList.add('visible');
      return;
    }
    
    resultsContainer.innerHTML = results.slice(0, 8).map(result => `
      <a href="${result.url}" class="search-result-item">
        <span class="search-result-title">${highlightMatch(result.title, query)}</span>
        <span class="search-result-section">${result.section}</span>
      </a>
    `).join('');
    
    resultsContainer.classList.add('visible');
  }
  
  function hideSearchResults() {
    if (resultsContainer) {
      resultsContainer.classList.remove('visible');
    }
  }
  
  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ================ */
/* SCROLL SPY (TOC) */
/* ================ */

function initScrollSpy() {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  
  const links = toc.querySelectorAll('a');
  const sections = [];
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const section = document.querySelector(href);
      if (section) {
        sections.push({ link, section });
      }
    }
  });
  
  if (sections.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const activeItem = sections.find(s => s.section === entry.target);
        if (activeItem) {
          activeItem.link.classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px'
  });
  
  sections.forEach(({ section }) => observer.observe(section));
}

/* ============ */
/* MOBILE MENU  */
/* ============ */

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!toggle || !sidebar) return;
  
  // Create overlay if it doesn't exist
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    toggle.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  });
  
  // Close when clicking a nav link (mobile)
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  });
}

/* ================== */
/* UTILITY FUNCTIONS  */
/* ================== */

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* Smooth Scroll for Anchor Links */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (anchor) {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

/* Keyboard Navigation */
document.addEventListener('keydown', (e) => {
  // ESC to close mobile menu
  if (e.key === 'Escape') {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
    
    // Close search results
    const searchResults = document.querySelector('.search-results');
    if (searchResults) searchResults.classList.remove('visible');
  }
  
  // / to focus search
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    const searchInput = document.querySelector('.search-input');
    if (searchInput && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  }
});

/* Lazy Load Images */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* Print & Theme Functions */
function printPage() {
  window.print();
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Check saved theme
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
})();

/* Export for external use */
window.SOCGuide = {
  initTabs,
  initAccordions,
  initCopyButtons,
  copyCode,
  debounce,
  toggleTheme,
  printPage
};
