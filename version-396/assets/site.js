(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const previous = document.querySelector('[data-slide-prev]');
    const next = document.querySelector('[data-slide-next]');
    let index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      slides[index].classList.remove('active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('active');
    }

    if (slides.length) {
      slides[0].classList.add('active');
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="keyword"]');
      const keyword = input ? input.value.trim() : '';
      const target = keyword ? 'archive.html?keyword=' + encodeURIComponent(keyword) : 'archive.html';
      window.location.href = target;
    });
  });

  const searchInput = document.querySelector('[data-search-input]');
  const categorySelect = document.querySelector('[data-category-filter]');
  const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    const keyword = normalize(searchInput ? searchInput.value : '');
    const category = normalize(categorySelect ? categorySelect.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize(card.textContent);
      const cardCategory = normalize(card.getAttribute('data-category'));
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchCategory = !category || cardCategory === category;
      const shouldShow = matchKeyword && matchCategory;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput || categorySelect) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword');
    if (keyword && searchInput) {
      searchInput.value = keyword;
    }
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', applyFilters);
    }
    applyFilters();
  }
})();
