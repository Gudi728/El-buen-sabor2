document.addEventListener('DOMContentLoaded', () => {
  const {
    sanitizeText,
    isValidUrl,
    isNonNegativeNumber,
    requestJson,
    createToast,
    runAsync
  } = window.AppHelpers;

  const TOKEN_KEY = 'ebs_admin_token_v1';

  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');

  const persistenceBadge = document.getElementById('persistence-badge');

  const categoryForm = document.getElementById('category-form');
  const categoryIdInput = document.getElementById('category-id');
  const categoryNameInput = document.getElementById('category-name');
  const categoryImageInput = document.getElementById('category-image');
  const categoryImageFileInput = document.getElementById('category-image-file');
  const uploadCategoryImageBtn = document.getElementById('upload-category-image-btn');
  const categoryActiveInput = document.getElementById('category-active');
  const categorySubmitBtn = document.getElementById('category-submit-btn');
  const categoryCancelBtn = document.getElementById('category-cancel-btn');
  const categoriesTableBody = document.getElementById('categories-table-body');

  const productForm = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productCategoryInput = document.getElementById('product-category');
  const productPriceInput = document.getElementById('product-price');
  const productDescriptionInput = document.getElementById('product-description');
  const productIngredientsInput = document.getElementById('product-ingredients');
  const productImageInput = document.getElementById('product-image');
  const productImageFileInput = document.getElementById('product-image-file');
  const uploadProductImageBtn = document.getElementById('upload-product-image-btn');
  const productAvailableInput = document.getElementById('product-available');
  const productFeaturedInput = document.getElementById('product-featured');
  const productSoldCountInput = document.getElementById('product-sold-count');
  const productSubmitBtn = document.getElementById('product-submit-btn');
  const productCancelBtn = document.getElementById('product-cancel-btn');
  const productsTableBody = document.getElementById('products-table-body');
  const productStatusFilter = document.getElementById('product-status-filter');
  const outOfStockCounter = document.getElementById('out-of-stock-counter');
  const outOfStockList = document.getElementById('out-of-stock-list');

  const deliveryCostInput = document.getElementById('delivery-cost');
  const deliverySaveStatus = document.getElementById('delivery-save-status');

  const scheduleForm = document.getElementById('schedule-form');
  const storeOpenTimeInput = document.getElementById('store-open-time');
  const storeCloseTimeInput = document.getElementById('store-close-time');
  const storeClosedTodayInput = document.getElementById('store-closed-today');
  const scheduleSaveBtn = document.getElementById('schedule-save-btn');

  const dayInputs = {
    monday: document.getElementById('day-monday'),
    tuesday: document.getElementById('day-tuesday'),
    wednesday: document.getElementById('day-wednesday'),
    thursday: document.getElementById('day-thursday'),
    friday: document.getElementById('day-friday'),
    saturday: document.getElementById('day-saturday'),
    sunday: document.getElementById('day-sunday')
  };

  const toastElement = document.getElementById('admin-toast');
  const toastBody = document.getElementById('admin-toast-body');
  const toastNotifier = createToast(toastElement, toastBody);

  const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  let adminToken = sessionStorage.getItem(TOKEN_KEY) || '';
  let appState = {
    categories: [],
    products: [],
    settings: {
      deliveryCost: 0,
      schedule: {
        apertura: '19:00',
        cierre: '00:00',
        cerradoPorHoy: false,
        dias: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        }
      }
    },
    persistence: { usingFirestore: false }
  };

  let deliverySaveTimer = null;

  function showToast(message) {
    toastNotifier.show(message);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function apiFetch(url, options = {}) {
    const payload = await requestJson(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        ...(options.headers || {})
      }
    });
    return payload.data;
  }

  function setLoginMode(enabled) {
    loginView.classList.toggle('d-none', !enabled);
    dashboardView.classList.toggle('d-none', enabled);
  }

  function resetCategoryForm() {
    categoryIdInput.value = '';
    categoryNameInput.value = '';
    categoryImageInput.value = '';
    categoryImageFileInput.value = '';
    categoryActiveInput.checked = true;
    categorySubmitBtn.textContent = 'Agregar categoria';
    categoryCancelBtn.classList.add('d-none');
  }

  function resetProductForm() {
    productIdInput.value = '';
    productNameInput.value = '';
    productPriceInput.value = '';
    productDescriptionInput.value = '';
    productIngredientsInput.value = '';
    productImageInput.value = '';
    productImageFileInput.value = '';
    productAvailableInput.checked = true;
    productFeaturedInput.checked = false;
    productSoldCountInput.value = '0';
    productSubmitBtn.textContent = 'Agregar producto';
    productCancelBtn.classList.add('d-none');
  }

  function getCategoryName(slug) {
    const category = appState.categories.find((item) => item.slug === slug);
    return category ? category.name : slug;
  }

  function renderCategoryOptions() {
    const activeCategories = appState.categories.filter((category) => category.isActive);

    productCategoryInput.innerHTML = activeCategories
      .map((category) => `<option value="${category.slug}">${escapeHtml(category.name)}</option>`)
      .join('');
  }

  function renderCategories() {
    categoriesTableBody.innerHTML = appState.categories
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(
        (category) => `
        <tr>
          <td>#${category.order}</td>
          <td><img src="${escapeHtml(category.image)}" alt="${escapeHtml(category.name)}" class="admin-thumb" loading="lazy"/></td>
          <td>${escapeHtml(category.name)}</td>
          <td>
            <span class="badge ${category.isActive ? 'text-bg-success' : 'text-bg-secondary'}">
              ${category.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </td>
          <td>
            <div class="d-flex flex-wrap gap-1">
              <button class="btn btn-sm btn-outline-secondary" data-action="up" data-id="${category.id}">
                <i class="fa-solid fa-arrow-up"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" data-action="down" data-id="${category.id}">
                <i class="fa-solid fa-arrow-down"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${category.id}">Editar</button>
              <button class="btn btn-sm btn-outline-warning" data-action="toggle" data-id="${category.id}">
                ${category.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${category.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');
  }

  function renderProducts() {
    const filterValue = productStatusFilter ? productStatusFilter.value : 'all';
    const filteredProducts = appState.products.filter((product) => {
      if (filterValue === 'available') return product.isAvailable === true;
      if (filterValue === 'out') return product.isAvailable === false;
      return true;
    });

    productsTableBody.innerHTML = filteredProducts
      .map(
        (product) => `
        <tr>
          <td><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="admin-thumb" loading="lazy"/></td>
          <td>
            <strong>${escapeHtml(product.name)}</strong>
            <p class="small text-muted mb-0">${escapeHtml(product.description || '')}</p>
          </td>
          <td>${escapeHtml(getCategoryName(product.categorySlug))}</td>
          <td>${money.format(product.price)}</td>
          <td>
            <span class="badge ${product.isAvailable ? 'text-bg-success' : 'text-bg-danger'}">
              ${product.isAvailable ? 'Disponible' : 'Agotado'}
            </span>
            <span class="badge ${product.isFeatured ? 'text-bg-warning' : 'text-bg-dark'} ms-1">
              ${product.isFeatured ? 'Destacado' : 'Normal'}
            </span>
          </td>
          <td>
            <div class="small text-muted mb-1">Vendidos: ${product.soldCount || 0}</div>
            <div class="form-check form-switch mb-2">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                data-product-action="toggle-switch"
                data-id="${product.id}"
                ${product.isAvailable ? 'checked' : ''}
              />
              <label class="form-check-label small">${product.isAvailable ? 'Disponible' : 'Agotado'}</label>
            </div>
            <div class="d-flex flex-wrap gap-1">
              <button class="btn btn-sm btn-outline-primary" data-product-action="edit" data-id="${product.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" data-product-action="delete" data-id="${product.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');
  }

  function renderOutOfStockQuickList() {
    const outProducts = appState.products
      .filter((product) => product.isAvailable === false)
      .sort((a, b) => a.name.localeCompare(b.name));

    outOfStockCounter.textContent = `Agotados: ${outProducts.length}`;

    if (!outProducts.length) {
      outOfStockList.innerHTML = '<li class="text-muted small">No hay productos agotados.</li>';
      return;
    }

    outOfStockList.innerHTML = outProducts
      .map((product) => `<li><strong>${escapeHtml(product.name)}</strong> · ${escapeHtml(getCategoryName(product.categorySlug))}</li>`)
      .join('');
  }

  function renderAll() {
    persistenceBadge.textContent = appState.persistence.usingFirestore
      ? 'Guardado automatico en Firebase'
      : 'Modo local (sin Firebase)';

    deliveryCostInput.value = appState.settings.deliveryCost || 0;

    const schedule = appState.settings.schedule || {};
    storeOpenTimeInput.value = schedule.apertura || '19:00';
    storeCloseTimeInput.value = schedule.cierre || '00:00';
    storeClosedTodayInput.checked = schedule.cerradoPorHoy === true;

    const days = schedule.dias || {};
    Object.entries(dayInputs).forEach(([key, input]) => {
      if (!input) return;
      input.checked = days[key] !== false;
    });

    renderCategoryOptions();
    renderCategories();
    renderProducts();
    renderOutOfStockQuickList();
  }

  async function loadBootstrap() {
    appState = await apiFetch('/api/admin/bootstrap');
    renderAll();
  }

  async function login(username, password) {
    const payload = await requestJson('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    adminToken = payload.data.token;
    sessionStorage.setItem(TOKEN_KEY, adminToken);
  }

  async function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(fileInput, folder) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      throw new Error('Selecciona una imagen para subir');
    }

    const dataUrl = await toDataUrl(file);
    const uploaded = await apiFetch('/api/admin/uploads/imagen', {
      method: 'POST',
      body: JSON.stringify({
        dataUrl,
        folder
      })
    });

    fileInput.value = '';
    return uploaded.url;
  }

  loginForm.addEventListener('submit', runAsync(async (event) => {
    event.preventDefault();
    loginError.classList.add('d-none');

    const username = sanitizeText(usernameInput.value, 50);
    const password = sanitizeText(passwordInput.value, 80);

    if (!username || !password) {
      loginError.textContent = 'Completa usuario y contraseña.';
      loginError.classList.remove('d-none');
      return;
    }

    await login(username, password);
    await loadBootstrap();
    setLoginMode(false);
    showToast('Sesion iniciada correctamente.');
  }, (error) => {
    loginError.textContent = error.message || 'Credenciales incorrectas';
    loginError.classList.remove('d-none');
  }));

  uploadCategoryImageBtn.addEventListener('click', runAsync(async () => {
    uploadCategoryImageBtn.disabled = true;
    try {
      const url = await uploadImage(categoryImageFileInput, 'categorias');
      categoryImageInput.value = url;
      showToast('Imagen de categoria subida.');
    } finally {
      uploadCategoryImageBtn.disabled = false;
    }
  }, (error) => {
    showToast(error.message || 'No se pudo subir la imagen.');
  }));

  uploadProductImageBtn.addEventListener('click', runAsync(async () => {
    uploadProductImageBtn.disabled = true;
    try {
      const url = await uploadImage(productImageFileInput, 'productos');
      productImageInput.value = url;
      showToast('Imagen de producto subida.');
    } finally {
      uploadProductImageBtn.disabled = false;
    }
  }, (error) => {
    showToast(error.message || 'No se pudo subir la imagen.');
  }));

  categoryForm.addEventListener('submit', runAsync(async (event) => {
    event.preventDefault();

    const payload = {
      name: sanitizeText(categoryNameInput.value, 80),
      image: sanitizeText(categoryImageInput.value, 500),
      isActive: categoryActiveInput.checked
    };

    if (!payload.name || !payload.image || !isValidUrl(payload.image)) {
      showToast('Completa nombre e imagen de la categoria.');
      return;
    }

    const categoryId = categoryIdInput.value;

    if (categoryId) {
      await apiFetch(`/api/admin/categorias/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Categoria actualizada.');
    } else {
      await apiFetch('/api/admin/categorias', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Categoria creada.');
    }

    await loadBootstrap();
    resetCategoryForm();
  }, (error) => {
    showToast(error.message || 'No se pudo guardar la categoria.');
  }));

  categoryCancelBtn.addEventListener('click', () => {
    resetCategoryForm();
  });

  categoriesTableBody.addEventListener('click', runAsync(async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.getAttribute('data-action');
    const categoryId = button.getAttribute('data-id');
    const ordered = appState.categories.slice().sort((a, b) => a.order - b.order);
    const current = ordered.find((item) => item.id === categoryId);
    if (!current) return;

    if (action === 'edit') {
      categoryIdInput.value = current.id;
      categoryNameInput.value = current.name;
      categoryImageInput.value = current.image;
      categoryActiveInput.checked = current.isActive;
      categorySubmitBtn.textContent = 'Guardar cambios';
      categoryCancelBtn.classList.remove('d-none');
      return;
    }

    if (action === 'toggle') {
      await apiFetch(`/api/admin/categorias/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !current.isActive })
      });
      await loadBootstrap();
      showToast('Estado de categoria actualizado.');
      return;
    }

    if (action === 'delete') {
      const accepted = window.confirm('Esta accion eliminara la categoria y sus productos. Continuar?');
      if (!accepted) return;
      await apiFetch(`/api/admin/categorias/${categoryId}`, { method: 'DELETE' });
      await loadBootstrap();
      showToast('Categoria eliminada.');
      return;
    }

    if (action === 'up' || action === 'down') {
      const index = ordered.findIndex((item) => item.id === categoryId);
      const nextIndex = action === 'up' ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

      const temp = ordered[index];
      ordered[index] = ordered[nextIndex];
      ordered[nextIndex] = temp;

      await apiFetch('/api/admin/categorias/reordenar', {
        method: 'POST',
        body: JSON.stringify({ orderedIds: ordered.map((item) => item.id) })
      });
      await loadBootstrap();
      showToast('Orden de categorias actualizado.');
    }
  }, (error) => {
    showToast(error.message || 'No se pudo completar la acción sobre categorias.');
  }));

  productForm.addEventListener('submit', runAsync(async (event) => {
    event.preventDefault();

    const payload = {
      name: sanitizeText(productNameInput.value, 120),
      categorySlug: productCategoryInput.value,
      price: Number(productPriceInput.value),
      description: sanitizeText(productDescriptionInput.value, 220),
      ingredients: sanitizeText(productIngredientsInput.value, 320),
      image: sanitizeText(productImageInput.value, 500),
      isAvailable: productAvailableInput.checked,
      isFeatured: productFeaturedInput.checked,
      soldCount: Number(productSoldCountInput.value)
    };

    if (
      !payload.name ||
      !payload.categorySlug ||
      !isNonNegativeNumber(payload.price) ||
      !isNonNegativeNumber(payload.soldCount) ||
      !isValidUrl(payload.image)
    ) {
      showToast('Revisa nombre, categoria y precio del producto.');
      return;
    }

    const productId = productIdInput.value;

    if (productId) {
      await apiFetch(`/api/admin/productos/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Producto actualizado.');
    } else {
      await apiFetch('/api/admin/productos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Producto creado.');
    }

    await loadBootstrap();
    resetProductForm();
  }, (error) => {
    showToast(error.message || 'No se pudo guardar el producto.');
  }));

  productCancelBtn.addEventListener('click', () => {
    resetProductForm();
  });

  productStatusFilter.addEventListener('change', () => {
    renderProducts();
  });

  productsTableBody.addEventListener('click', runAsync(async (event) => {
    const button = event.target.closest('button[data-product-action], input[data-product-action]');
    if (!button) return;

    const action = button.getAttribute('data-product-action');
    const productId = button.getAttribute('data-id');
    const product = appState.products.find((item) => item.id === productId);
    if (!product) return;

    if (action === 'edit') {
      productIdInput.value = product.id;
      productNameInput.value = product.name;
      productCategoryInput.value = product.categorySlug;
      productPriceInput.value = product.price;
      productDescriptionInput.value = product.description || '';
      productIngredientsInput.value = product.ingredients || '';
      productImageInput.value = product.image || '';
      productAvailableInput.checked = product.isAvailable;
      productFeaturedInput.checked = product.isFeatured;
      productSoldCountInput.value = String(product.soldCount || 0);
      productSubmitBtn.textContent = 'Guardar cambios';
      productCancelBtn.classList.remove('d-none');
      return;
    }

    if (action === 'toggle-switch') {
      const nextAvailable = button instanceof HTMLInputElement ? button.checked : !product.isAvailable;
      await apiFetch(`/api/admin/productos/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: nextAvailable })
      });
      await loadBootstrap();
      showToast('Disponibilidad de producto actualizada.');
      return;
    }

    if (action === 'delete') {
      const accepted = window.confirm('Eliminar este producto?');
      if (!accepted) return;
      await apiFetch(`/api/admin/productos/${productId}`, { method: 'DELETE' });
      await loadBootstrap();
      showToast('Producto eliminado.');
    }
  }, (error) => {
    showToast(error.message || 'No se pudo completar la acción sobre productos.');
  }));

  deliveryCostInput.addEventListener('input', () => {
    const parsed = Number(deliveryCostInput.value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      deliverySaveStatus.textContent = 'Ingresa un costo valido para guardar.';
      return;
    }

    deliverySaveStatus.textContent = 'Guardando...';

    if (deliverySaveTimer) {
      clearTimeout(deliverySaveTimer);
    }

    deliverySaveTimer = window.setTimeout(async () => {
      try {
        const updated = await apiFetch('/api/admin/settings/delivery', {
          method: 'PUT',
          body: JSON.stringify({ deliveryCost: parsed })
        });
        appState.settings = updated;
        deliverySaveStatus.textContent = 'Costo guardado automaticamente.';
      } catch (error) {
        deliverySaveStatus.textContent = 'No se pudo guardar el costo.';
      }
    }, 450);
  });

  scheduleForm.addEventListener('submit', runAsync(async (event) => {
    event.preventDefault();

    const openTime = sanitizeText(storeOpenTimeInput.value, 10);
    const closeTime = sanitizeText(storeCloseTimeInput.value, 10);

    if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime)) {
      showToast('Ingresa horas validas para apertura y cierre.');
      return;
    }

    const days = Object.fromEntries(
      Object.entries(dayInputs).map(([key, input]) => [key, input && input.checked === true])
    );

    const atLeastOneDay = Object.values(days).some((value) => value === true);
    if (!atLeastOneDay) {
      showToast('Activa al menos un dia de atencion.');
      return;
    }

    scheduleSaveBtn.disabled = true;
    scheduleSaveBtn.textContent = 'Guardando...';

    try {
      const payload = await apiFetch('/api/admin/settings/horario', {
        method: 'PUT',
        body: JSON.stringify({
          openTime,
          closeTime,
          closedToday: storeClosedTodayInput.checked,
          days
        })
      });

      appState.settings.schedule = {
        apertura: payload.openTime,
        cierre: payload.closeTime,
        cerradoPorHoy: payload.closedToday,
        dias: payload.days
      };

      showToast('Horario guardado correctamente.');
    } finally {
      scheduleSaveBtn.disabled = false;
      scheduleSaveBtn.textContent = 'Guardar horario';
    }
  }, (error) => {
    showToast(error.message || 'No se pudo guardar el horario.');
  }));

  async function bootstrapAdmin() {
    if (!adminToken) {
      setLoginMode(true);
      return;
    }

    try {
      await loadBootstrap();
      setLoginMode(false);
    } catch (error) {
      sessionStorage.removeItem(TOKEN_KEY);
      adminToken = '';
      setLoginMode(true);
    }
  }

  bootstrapAdmin();
});
