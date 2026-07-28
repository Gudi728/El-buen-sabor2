document.addEventListener('DOMContentLoaded', () => {
  const { sanitizeText, getStoredArray, setStoredArray, debounce, requestJson } = window.AppHelpers;
  const CART_STORAGE_KEY = 'ebs_cart_v1';
  const titleEl = document.getElementById('menu-title');
  const subtitleEl = document.getElementById('menu-subtitle');
  const categoriesSection = document.getElementById('categories-section');
  const productsSection = document.getElementById('products-section');
  const categoriesGrid = document.getElementById('categories-grid');
  const productsGrid = document.getElementById('products-grid');
  const categoryTemplate = document.getElementById('category-card-template');
  const productTemplate = document.getElementById('product-card-template');
  const toastElement = document.getElementById('cart-toast');
  const cartToast = toastElement ? new bootstrap.Toast(toastElement) : null;
  const featuredGrid = document.getElementById('featured-grid');
  const topSellingGrid = document.getElementById('top-selling-grid');
  const globalProductsGrid = document.getElementById('global-products-grid');
  const globalProductsSection = document.getElementById('global-products-section');
  const featuredSection = document.getElementById('featured-section');
  const topSellingSection = document.getElementById('top-selling-section');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const productsCounter = document.getElementById('products-counter');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const loader = document.getElementById('catalog-loader');
  const productInfoModalEl = document.getElementById('productInfoModal');
  const productInfoModal = productInfoModalEl ? new bootstrap.Modal(productInfoModalEl) : null;
  const modalTitle = document.getElementById('product-modal-title');
  const modalDescription = document.getElementById('product-modal-description');
  const modalExtra = document.getElementById('product-modal-extra');

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const categorySlug = pathParts[0] === 'categoria' && pathParts[1] ? pathParts[1] : null;

  const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  let allCategories = [];
  let allProducts = [];
  let productsStream = null;

  const imageObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const img = entry.target;
              const source = img.getAttribute('data-src');
              if (source) {
                img.src = source;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            });
          },
          { rootMargin: '140px' }
        )
      : null;

  function showLoader(visible) {
    loader.classList.toggle('d-none', !visible);
  }

  function observeLazyImages(root) {
    const images = root.querySelectorAll('img[data-src]');

    images.forEach((img) => {
      if (imageObserver) {
        imageObserver.observe(img);
      } else {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      }
    });
  }

  function getCart() {
    return getStoredArray(CART_STORAGE_KEY);
  }

  function saveCart(cart) {
    setStoredArray(CART_STORAGE_KEY, cart);
  }

  function addToCart({ product, note }) {
    if (!product.isAvailable) {
      return;
    }

    const cart = getCart();
    const cleanNote = sanitizeText(note);
    const existingItem = cart.find(
      (item) => item.productId === product.id && sanitizeText(item.note) === cleanNote
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        itemId: `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        productId: product.id,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        name: product.name,
        image: product.image,
        price: product.price,
        ingredients: product.ingredients,
        note: cleanNote,
        quantity: 1,
        createdAt: new Date().toISOString()
      });
    }

    saveCart(cart);
    if (cartToast) cartToast.show();
  }

  function renderCategories(categories) {
    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      const node = categoryTemplate.content.cloneNode(true);
      const link = node.querySelector('.category-card');
      const image = node.querySelector('.category-image');
      const title = node.querySelector('.category-name');

      link.href = `/categoria/${category.slug}`;
      image.setAttribute('data-src', category.image);
      image.alt = category.name;
      title.textContent = category.name;

      fragment.appendChild(node);
    });

    categoriesGrid.innerHTML = '';
    categoriesGrid.appendChild(fragment);
    observeLazyImages(categoriesGrid);
  }

  function attachProductCardData(card, product) {
    const image = card.querySelector('.product-image');
    const price = card.querySelector('.product-price');
    const name = card.querySelector('.product-name');
    const description = card.querySelector('.product-description');
    const ingredients = card.querySelector('.product-ingredients');
    const sold = card.querySelector('.product-sold');
    const featured = card.querySelector('.product-featured');
    const stockBadge = card.querySelector('.product-stock-badge');
    const unavailableMessage = card.querySelector('.product-unavailable-message');
    const noteInput = card.querySelector('.product-note');
    const addButton = card.querySelector('.add-to-cart-btn');

    image.setAttribute('data-src', product.image);
    image.alt = product.name;
    name.textContent = product.name;
    description.textContent = product.description || '';
    ingredients.textContent = product.ingredients;
    price.textContent = money.format(product.price);
    sold.textContent = `${product.soldCount || 0} vendidos`;

    if (product.isFeatured) {
      featured.classList.remove('d-none');
    } else {
      featured.classList.add('d-none');
    }

    const unavailable = product.isAvailable === false;
    card.classList.toggle('is-out-of-stock', unavailable);
    stockBadge.classList.toggle('d-none', !unavailable);
    unavailableMessage.classList.toggle('d-none', !unavailable);
    addButton.disabled = unavailable;
    addButton.innerHTML = unavailable
      ? '<i class="fa-solid fa-ban me-2"></i>Agotado'
      : '<i class="fa-solid fa-plus me-2"></i>Agregar al carrito';
    noteInput.disabled = unavailable;

    noteInput.id = `note-${product.id}-${Math.floor(Math.random() * 10000)}`;
    card.querySelector('label').setAttribute('for', noteInput.id);

    addButton.addEventListener('click', () => {
      if (product.isAvailable === false) return;
      addToCart({ product, note: noteInput.value });
      noteInput.value = '';
    });

    card.addEventListener('dblclick', () => {
      if (!productInfoModal) return;
      modalTitle.textContent = product.name;
      modalDescription.textContent = product.description || product.ingredients;
      modalExtra.textContent = `${product.categoryName} · ${money.format(product.price)} · ${product.soldCount || 0} vendidos`;
      productInfoModal.show();
    });
  }

  function renderProductsIntoGrid(products, gridElement) {
    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const node = productTemplate.content.cloneNode(true);
      const card = node.querySelector('.product-card');
      attachProductCardData(card, product);
      fragment.appendChild(node);
    });

    gridElement.innerHTML = '';
    gridElement.appendChild(fragment);
    observeLazyImages(gridElement);
  }

  function renderHomeProductSections(products) {
    const featured = products.filter((item) => item.isFeatured).slice(0, 6);
    const topSelling = products
      .filter((item) => (Number(item.soldCount) || 0) > 0)
      .slice()
      .sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0))
      .slice(0, 6);

    renderProductsIntoGrid(featured, featuredGrid);
    renderProductsIntoGrid(topSelling, topSellingGrid);
  }

  function fillCategoryFilter(categories) {
    categoryFilter.innerHTML = '<option value="">Todas</option>';
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.slug;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
  }

  function applyClientFilters() {
    const searchTerm = sanitizeText(searchInput.value).toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = allProducts.filter((product) => {
      if (selectedCategory && product.categorySlug !== selectedCategory) return false;
      if (!searchTerm) return true;

      const searchable = [
        product.name,
        product.description,
        product.ingredients,
        product.categoryName
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(searchTerm);
    });

    renderProductsIntoGrid(filtered, globalProductsGrid);
    productsCounter.textContent = `${filtered.length} productos`;
  }

  function applyCategoryProducts(products) {
    const filtered = products.filter((product) => product.categorySlug === categorySlug);
    renderProductsIntoGrid(filtered, productsGrid);
  }

  async function fetchJson(url) {
    const payload = await requestJson(url);
    return payload.data;
  }

  async function loadCategoriesList() {
    titleEl.textContent = 'Categorias';
    subtitleEl.textContent = 'Explora, filtra y agrega tus productos favoritos.';
    categoriesSection.classList.remove('d-none');
    productsSection.classList.add('d-none');

    globalProductsSection.classList.remove('d-none');
    featuredSection.classList.remove('d-none');
    topSellingSection.classList.remove('d-none');

    showLoader(true);

    const [categories, products] = await Promise.all([
      fetchJson('/api/categorias'),
      fetchJson('/api/productos')
    ]);

    showLoader(false);

    allCategories = categories;
    allProducts = products;

    fillCategoryFilter(categories);
    renderCategories(categories);
    renderHomeProductSections(products);
    applyClientFilters();
  }

  async function loadCategoryDetail(slug) {
    showLoader(true);
    const payload = await fetchJson(`/api/categorias/${slug}`);
    showLoader(false);

    const { category, products } = payload;

    titleEl.textContent = category.name;
    subtitleEl.textContent = 'Elegi tus productos y agrega una aclaracion si lo necesitas.';
    categoriesSection.classList.add('d-none');
    productsSection.classList.remove('d-none');

    globalProductsSection.classList.add('d-none');
    featuredSection.classList.add('d-none');
    topSellingSection.classList.add('d-none');
    document.getElementById('catalog-tools').classList.add('d-none');

    renderProductsIntoGrid(products, productsGrid);
  }

  function connectProductsStream() {
    if (!window.EventSource) return;

    productsStream = new EventSource('/api/productos/stream');

    productsStream.addEventListener('products', (event) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        const products = Array.isArray(payload?.data?.products) ? payload.data.products : [];
        allProducts = products;

        if (categorySlug) {
          applyCategoryProducts(products);
        } else {
          renderHomeProductSections(products);
          applyClientFilters();
        }
      } catch (error) {
        // Ignorar payload invalido y mantener el ultimo estado renderizado.
      }
    });

    window.addEventListener('beforeunload', () => {
      if (productsStream) {
        productsStream.close();
        productsStream = null;
      }
    });
  }

  function setupListeners() {
    searchInput.addEventListener('input', debounce(applyClientFilters, 220));

    categoryFilter.addEventListener('change', applyClientFilters);

    resetFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      categoryFilter.value = '';
      applyClientFilters();
    });
  }

  async function bootstrapMenu() {
    try {
      setupListeners();
      if (categorySlug) {
        await loadCategoryDetail(categorySlug);
      } else {
        await loadCategoriesList();
      }

      connectProductsStream();
    } catch (error) {
      showLoader(false);
      titleEl.textContent = 'Ups, hubo un problema';
      subtitleEl.textContent = 'No pudimos cargar el menu. Intenta nuevamente en unos segundos.';
      categoriesGrid.innerHTML = '';
      productsGrid.innerHTML = '';
      featuredGrid.innerHTML = '';
      topSellingGrid.innerHTML = '';
      globalProductsGrid.innerHTML = '';
      productsCounter.textContent = '0 productos';
    }
  }

  bootstrapMenu();
});
