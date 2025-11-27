/* SOC Analyst Guide - Main JavaScript */
/* ===================================== */

document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initTabs();
  initAccordions();
  initCopyButtons();
  initSearch();
  initScrollSpy();
  initMobileMenu();
});

/* Sidebar Navigation */
function initSidebar() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath || 
        currentPath.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
      
      // Expand parent section if nested
      const section = link.closest('.nav-section');
      if (section) {
        section.classList.add('expanded');
      }
    }
  });
  
  // Initialize sidebar toggle
  initSidebarToggle();
}

/* Sidebar Toggle */
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
    
    // Save state to localStorage
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed);
  });
}

/* Tab Component */
function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs');
  
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        // Remove active from all
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active to clicked
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

/* Accordion Component */
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion');
  
  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion-item');
    
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items in this accordion (optional: remove for multi-open)
        // items.forEach(i => i.classList.remove('active'));
        
        // Toggle clicked item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    });
  });
}

/* Copy to Clipboard */
function initCopyButtons() {
  // Add copy buttons to code blocks
  const codeBlocks = document.querySelectorAll('.code-block, .query-box');
  
  codeBlocks.forEach(block => {
    if (block.querySelector('.copy-btn')) return; // Already has button
    
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => copyCode(block, btn));
    
    const header = block.querySelector('.query-header');
    if (header) {
      header.appendChild(btn);
    } else {
      block.style.position = 'relative';
      block.appendChild(btn);
    }
  });
  
  // Also handle pre elements
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
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => copyCode(wrapper, btn));
    wrapper.appendChild(btn);
  });
}

function copyCode(block, btn) {
  const code = block.querySelector('code') || block.querySelector('pre');
  if (!code) return;
  
  const text = code.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    btn.textContent = 'Error';
  });
}

/* Search Functionality */
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;
  
  const searchIndex = buildSearchIndex();
  
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    const results = searchIndex.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    displaySearchResults(results, query);
  }, 200));
}

function buildSearchIndex() {
  // This would be populated by the actual page content
  // For now, return empty array - will be generated per page
  return window.searchIndex || [];
}

function displaySearchResults(results, query) {
  let container = document.querySelector('.search-results');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'search-results';
    document.querySelector('.search-box').appendChild(container);
  }
  
  if (results.length === 0) {
    container.innerHTML = '<div class="search-no-results">No results found</div>';
    container.classList.add('visible');
    return;
  }
  
  container.innerHTML = results.slice(0, 10).map(result => `
    <a href="${result.url}" class="search-result-item">
      <div class="search-result-title">${highlightMatch(result.title, query)}</div>
      <div class="search-result-section">${result.section}</div>
    </a>
  `).join('');
  
  container.classList.add('visible');
}

function hideSearchResults() {
  const container = document.querySelector('.search-results');
  if (container) {
    container.classList.remove('visible');
  }
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Scroll Spy for TOC */
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

/* Mobile Menu */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!toggle || !sidebar) return;
  
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    toggle.classList.toggle('active');
  });
  
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
      toggle.classList.remove('active');
    }
  });
  
  // Close sidebar when clicking a link (mobile)
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
  });
}

/* Utility Functions */
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* Keyboard Navigation */
document.addEventListener('keydown', (e) => {
  // ESC to close mobile menu
  if (e.key === 'Escape') {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
    }
    
    // Also close search results
    hideSearchResults();
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

/* Print Button */
function printPage() {
  window.print();
}

/* Dark/Light Theme Toggle (if needed) */
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Check saved theme preference
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
})();

/* Export for use in other scripts */
window.SOCGuide = {
  initTabs,
  initAccordions,
  initCopyButtons,
  copyCode,
  debounce,
  toggleTheme,
  printPage
};