const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');
const slugify = require('../utils/slugify');

const CONFIG_DOC_ID = 'app';

const seedCategories = [
  {
    id: 'cat-sandwiches',
    slug: 'sandwiches',
    nombre: 'Sandwiches',
    imagen:
      'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=1200&q=80',
    orden: 1,
    activa: true
  },
  {
    id: 'cat-hamburguesas',
    slug: 'hamburguesas',
    nombre: 'Hamburguesas',
    imagen:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    orden: 2,
    activa: true
  },
  {
    id: 'cat-lomitos',
    slug: 'lomitos',
    nombre: 'Lomitos',
    imagen:
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80',
    orden: 3,
    activa: true
  },
  {
    id: 'cat-pizzas',
    slug: 'pizzas',
    nombre: 'Pizzas',
    imagen:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    orden: 4,
    activa: true
  },
  {
    id: 'cat-empanadas',
    slug: 'empanadas',
    nombre: 'Empanadas',
    imagen:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
    orden: 5,
    activa: true
  },
  {
    id: 'cat-papas-fritas',
    slug: 'papas-fritas',
    nombre: 'Papas Fritas',
    imagen:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',
    orden: 6,
    activa: true
  },
  {
    id: 'cat-bebidas',
    slug: 'bebidas',
    nombre: 'Bebidas',
    imagen:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
    orden: 7,
    activa: true
  },
  {
    id: 'cat-postres',
    slug: 'postres',
    nombre: 'Postres',
    imagen:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80',
    orden: 8,
    activa: true
  }
];

const seedProducts = [
  {
    id: 'pro-san-01',
    categoriaSlug: 'sandwiches',
    nombre: 'Sandwich de Milanesa Completo',
    descripcion: 'Clasico sandwich abundante y artesanal.',
    ingredientes: 'Pan artesanal, milanesa, lechuga, tomate, jamon, queso y mayonesa.',
    imagen:
      'https://images.unsplash.com/photo-1481070414801-51fd732d7184?auto=format&fit=crop&w=1200&q=80',
    precio: 6900,
    disponible: true,
    destacado: true,
    vendidos: 21
  },
  {
    id: 'pro-ham-01',
    categoriaSlug: 'hamburguesas',
    nombre: 'Burger Doble Cheddar',
    descripcion: 'Carne premium con cheddar fundido.',
    ingredientes: 'Doble carne, cheddar, cebolla caramelizada, pepinillos y salsa especial.',
    imagen:
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80',
    precio: 7600,
    disponible: true,
    destacado: true,
    vendidos: 35
  },
  {
    id: 'pro-lom-01',
    categoriaSlug: 'lomitos',
    nombre: 'Lomito Clasico',
    descripcion: 'Lomito completo bien cordobes.',
    ingredientes: 'Lomo, jamon, queso, huevo, lechuga, tomate y aderezo de la casa.',
    imagen:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1200&q=80',
    precio: 7900,
    disponible: true,
    destacado: false,
    vendidos: 18
  },
  {
    id: 'pro-piz-01',
    categoriaSlug: 'pizzas',
    nombre: 'Pizza Muzzarella Grande',
    descripcion: 'Masa madurada con muzzarella premium.',
    ingredientes: 'Masa madurada, salsa casera, muzzarella y oregano.',
    imagen:
      'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1200&q=80',
    precio: 9800,
    disponible: true,
    destacado: true,
    vendidos: 44
  },
  {
    id: 'pro-emp-01',
    categoriaSlug: 'empanadas',
    nombre: 'Empanada de Carne Suave',
    descripcion: 'Rellena a cuchillo con condimento suave.',
    ingredientes: 'Carne cortada a cuchillo, cebolla, morron, huevo y condimentos suaves.',
    imagen:
      'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80',
    precio: 1500,
    disponible: true,
    destacado: false,
    vendidos: 57
  },
  {
    id: 'pro-pap-01',
    categoriaSlug: 'papas-fritas',
    nombre: 'Papas Fritas Cheddar y Panceta',
    descripcion: 'Papas crocantes con topping completo.',
    ingredientes: 'Papas crocantes, cheddar fundido, panceta crocante y verdeo.',
    imagen:
      'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=1200&q=80',
    precio: 5400,
    disponible: true,
    destacado: true,
    vendidos: 31
  },
  {
    id: 'pro-beb-01',
    categoriaSlug: 'bebidas',
    nombre: 'Gaseosa 1.5L',
    descripcion: 'Bebida grande para compartir.',
    ingredientes: 'Bebida gaseosa sabor cola, lima limon o naranja.',
    imagen:
      'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80',
    precio: 2900,
    disponible: true,
    destacado: false,
    vendidos: 29
  },
  {
    id: 'pro-pos-01',
    categoriaSlug: 'postres',
    nombre: 'Flan Casero con Dulce',
    descripcion: 'Postre artesanal de la casa.',
    ingredientes: 'Flan artesanal, crema batida y dulce de leche.',
    imagen:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
    precio: 3600,
    disponible: true,
    destacado: false,
    vendidos: 14
  }
];

const state = {
  initialized: false,
  usingFirestore: false,
  productsRealtimeAttached: false,
  productsSubscribers: new Map(),
  productsSubscriberSeq: 0,
  productsUnsubscribeFn: null,
  categorias: [],
  productos: [],
  configuracion: {
    costoDelivery: 0,
    horario: {
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
  }
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sabado',
  sunday: 'Domingo'
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function toPublicCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.nombre,
    image: category.imagen,
    order: category.orden,
    isActive: category.activa
  };
}

function toPublicProduct(product, category) {
  return {
    id: product.id,
    categoryId: product.categoriaId,
    categorySlug: product.categoriaSlug,
    categoryName: category?.nombre || product.categoriaSlug,
    name: product.nombre,
    description: product.descripcion,
    ingredients: product.ingredientes,
    image: product.imagen,
    price: product.precio,
    isAvailable: product.disponible,
    isFeatured: product.destacado,
    soldCount: product.vendidos
  };
}

function getActiveCategoriesBySlug() {
  return new Map(state.categorias.filter((cat) => cat.activa).map((cat) => [cat.slug, cat]));
}

function getPublicProductsFromState({ search, categorySlug, featuredOnly, topSellingOnly, limit }) {
  const searchTerm = String(search || '').trim().toLowerCase();
  const parsedLimit = Number(limit);
  const activeBySlug = getActiveCategoriesBySlug();

  let products = state.productos.filter((item) => {
    const category = activeBySlug.get(item.categoriaSlug);
    if (!category) return false;
    if (categorySlug && item.categoriaSlug !== categorySlug) return false;
    if (featuredOnly && !item.destacado) return false;
    if (topSellingOnly && item.vendidos <= 0) return false;

    if (!searchTerm) return true;

    const haystack = [item.nombre, item.descripcion, item.ingredientes, category.nombre]
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm);
  });

  if (topSellingOnly) {
    products = products.sort((a, b) => b.vendidos - a.vendidos);
  }

  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    products = products.slice(0, parsedLimit);
  }

  return products.map((item) => toPublicProduct(item, activeBySlug.get(item.categoriaSlug)));
}

function broadcastProductsSnapshot() {
  if (!state.productsSubscribers.size) return;

  const products = getPublicProductsFromState({});
  const payload = {
    products,
    updatedAt: new Date().toISOString()
  };

  for (const notify of state.productsSubscribers.values()) {
    try {
      notify(payload);
    } catch (error) {
      // Ignorar suscriptor fallido; se limpia desde el cierre del stream.
    }
  }
}

function attachProductsRealtimeIfNeeded() {
  if (!state.usingFirestore || state.productsRealtimeAttached) return;

  const db = getFirestore();
  if (!db) return;

  state.productsUnsubscribeFn = db.collection('productos').onSnapshot((snapshot) => {
    state.productos = snapshot.docs.map((doc) => normalizeProducto(doc.data()));
    broadcastProductsSnapshot();
  });

  state.productsRealtimeAttached = true;
}

function normalizeCategoria(raw, index) {
  return {
    id: raw.id || crypto.randomUUID(),
    slug: String(raw.slug || slugify(raw.nombre) || `categoria-${index + 1}`),
    nombre: String(raw.nombre || 'Categoria'),
    imagen: String(raw.imagen || ''),
    orden: Number.isFinite(Number(raw.orden)) ? Number(raw.orden) : index + 1,
    activa: raw.activa !== false
  };
}

function normalizeProducto(raw) {
  return {
    id: raw.id || crypto.randomUUID(),
    categoriaId: String(raw.categoriaId || ''),
    categoriaSlug: String(raw.categoriaSlug || ''),
    nombre: String(raw.nombre || ''),
    descripcion: String(raw.descripcion || ''),
    ingredientes: String(raw.ingredientes || ''),
    imagen: String(raw.imagen || ''),
    precio: Number(raw.precio) || 0,
    disponible: raw.disponible !== false,
    destacado: raw.destacado === true,
    vendidos: Number.isFinite(Number(raw.vendidos)) ? Number(raw.vendidos) : 0
  };
}

function normalizeTime(raw, fallback) {
  const time = String(raw || '').trim();
  return /^\d{2}:\d{2}$/.test(time) ? time : fallback;
}

function normalizeSchedule(raw) {
  const base = {
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
  };

  const source = raw || {};
  const sourceDays = source.dias || {};

  return {
    apertura: normalizeTime(source.apertura, base.apertura),
    cierre: normalizeTime(source.cierre, base.cierre),
    cerradoPorHoy: source.cerradoPorHoy === true,
    dias: {
      monday: sourceDays.monday !== false,
      tuesday: sourceDays.tuesday !== false,
      wednesday: sourceDays.wednesday !== false,
      thursday: sourceDays.thursday !== false,
      friday: sourceDays.friday !== false,
      saturday: sourceDays.saturday !== false,
      sunday: sourceDays.sunday !== false
    }
  };
}

function toMinutes(timeString) {
  const [hh, mm] = String(timeString || '00:00').split(':').map((part) => Number(part) || 0);
  return hh * 60 + mm;
}

function getActiveDaysText(daysMap) {
  const activeDays = Object.entries(daysMap)
    .filter(([, active]) => active)
    .map(([key]) => DAY_LABELS[key]);

  if (!activeDays.length) return 'Sin dias activos';
  if (activeDays.length === 7) return 'Lunes a Domingo';

  return activeDays.join(', ');
}

function isOpenNow(horario) {
  if (horario.cerradoPorHoy) {
    return false;
  }

  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const prevDayKey = DAY_KEYS[(now.getDay() + 6) % 7];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const openMinutes = toMinutes(horario.apertura);
  const closeMinutes = toMinutes(horario.cierre);
  const crossesMidnight = closeMinutes <= openMinutes;

  const currentDayEnabled = horario.dias[dayKey] === true;
  const prevDayEnabled = horario.dias[prevDayKey] === true;

  if (!crossesMidnight) {
    return currentDayEnabled && nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }

  if (currentDayEnabled && nowMinutes >= openMinutes) {
    return true;
  }

  if (prevDayEnabled && nowMinutes < closeMinutes) {
    return true;
  }

  return false;
}

async function syncToFirestore() {
  if (!state.usingFirestore) return;

  const db = getFirestore();
  if (!db) return;

  const batch = db.batch();

  for (const categoria of state.categorias) {
    batch.set(db.collection('categorias').doc(categoria.id), categoria, { merge: true });
  }

  for (const producto of state.productos) {
    batch.set(db.collection('productos').doc(producto.id), producto, { merge: true });
  }

  batch.set(
    db.collection('configuracion').doc(CONFIG_DOC_ID),
    state.configuracion,
    { merge: true }
  );

  await batch.commit();
}

function hydrateSeed() {
  state.categorias = seedCategories.map((item, index) => normalizeCategoria(item, index));

  state.productos = seedProducts.map((item) => {
    const categoria = state.categorias.find((cat) => cat.slug === item.categoriaSlug);
    return normalizeProducto({
      ...item,
      categoriaId: categoria ? categoria.id : ''
    });
  });
}

async function ensureInitialized() {
  if (state.initialized) return;

  const db = getFirestore();
  state.usingFirestore = Boolean(db);

  if (!db) {
    hydrateSeed();
    state.initialized = true;
    return;
  }

  const [categoriasSnap, productosSnap, configSnap] = await Promise.all([
    db.collection('categorias').get(),
    db.collection('productos').get(),
    db.collection('configuracion').doc(CONFIG_DOC_ID).get()
  ]);

  state.categorias = categoriasSnap.docs.map((doc, index) => normalizeCategoria(doc.data(), index));
  state.productos = productosSnap.docs.map((doc) => normalizeProducto(doc.data()));

  if (configSnap.exists) {
    const conf = configSnap.data() || {};
    const cost = Number(conf.costoDelivery);
    state.configuracion.costoDelivery = Number.isFinite(cost) && cost >= 0 ? cost : 0;
    state.configuracion.horario = normalizeSchedule(conf.horario);
  }

  if (!state.categorias.length) {
    hydrateSeed();
    await syncToFirestore();
  }

  state.categorias.sort((a, b) => a.orden - b.orden);
  state.initialized = true;
}

function findCategoryBySlug(slug) {
  return state.categorias.find((item) => item.slug === slug) || null;
}

function uniqueCategorySlug(baseName) {
  const base = slugify(baseName) || 'categoria';
  let slug = base;
  let idx = 2;

  while (state.categorias.some((item) => item.slug === slug)) {
    slug = `${base}-${idx}`;
    idx += 1;
  }

  return slug;
}

async function getPublicCategories() {
  await ensureInitialized();

  return state.categorias
    .filter((item) => item.activa)
    .sort((a, b) => a.orden - b.orden)
    .map((item) => toPublicCategory(item));
}

async function getPublicCategoryBySlug(slug) {
  await ensureInitialized();
  const category = state.categorias.find((item) => item.slug === slug && item.activa);
  return category ? toPublicCategory(category) : null;
}

async function getPublicProductsByCategorySlug(slug) {
  await ensureInitialized();

  const category = findCategoryBySlug(slug);
  if (!category || !category.activa) {
    return [];
  }

  return state.productos
    .filter((item) => item.categoriaSlug === slug)
    .map((item) => toPublicProduct(item, category));
}

async function getPublicProducts({ search, categorySlug, featuredOnly, topSellingOnly, limit }) {
  await ensureInitialized();
  return getPublicProductsFromState({ search, categorySlug, featuredOnly, topSellingOnly, limit });
}

async function getPublicProductById(productId) {
  await ensureInitialized();

  const product = state.productos.find((item) => item.id === productId);
  if (!product) return null;

  const category = findCategoryBySlug(product.categoriaSlug);
  if (!category || !category.activa) return null;

  return toPublicProduct(product, category);
}

async function subscribePublicProducts(onData) {
  await ensureInitialized();
  attachProductsRealtimeIfNeeded();

  const id = `sub-${Date.now()}-${state.productsSubscriberSeq++}`;
  state.productsSubscribers.set(id, onData);

  onData({
    products: getPublicProductsFromState({}),
    updatedAt: new Date().toISOString()
  });

  return () => {
    state.productsSubscribers.delete(id);
  };
}

async function getPublicDeliverySettings() {
  await ensureInitialized();
  return {
    deliveryCost: state.configuracion.costoDelivery
  };
}

async function getPublicStoreStatus() {
  await ensureInitialized();

  const horario = normalizeSchedule(state.configuracion.horario);
  const openNow = isOpenNow(horario);
  const scheduleText = `${getActiveDaysText(horario.dias)}: ${horario.apertura} a ${horario.cierre}`;

  return {
    isOpen: openNow,
    statusLabel: openNow ? 'Abierto ahora' : 'Cerrado',
    schedule: horario,
    scheduleText,
    closedMessage:
      'En este momento la rotiseria se encuentra cerrada. Puedes ver nuestro menu, pero los pedidos estaran disponibles cuando volvamos a abrir.',
    canPlaceOrders: openNow
  };
}

async function getAdminSnapshot() {
  await ensureInitialized();

  const categorias = state.categorias
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((item) => toPublicCategory(item));

  const productos = state.productos.map((item) => {
    const category = findCategoryBySlug(item.categoriaSlug);
    return toPublicProduct(item, category);
  });

  return {
    categories: categorias,
    products: productos,
    settings: {
      deliveryCost: state.configuracion.costoDelivery,
      schedule: normalizeSchedule(state.configuracion.horario)
    },
    persistence: {
      usingFirestore: state.usingFirestore
    }
  };
}

async function createCategory(data) {
  await ensureInitialized();

  const name = String(data.name || '').trim();
  const image = String(data.image || '').trim();

  if (!name || !image) {
    throw new Error('Nombre e imagen son obligatorios');
  }

  const categoria = normalizeCategoria(
    {
      id: crypto.randomUUID(),
      slug: uniqueCategorySlug(name),
      nombre: name,
      imagen: image,
      orden: state.categorias.length + 1,
      activa: data.isActive !== false
    },
    state.categorias.length
  );

  state.categorias.push(categoria);
  await syncToFirestore();

  return toPublicCategory(categoria);
}

async function updateCategory(categoryId, data) {
  await ensureInitialized();

  const categoria = state.categorias.find((item) => item.id === categoryId);
  if (!categoria) return null;

  const oldSlug = categoria.slug;

  if (typeof data.name === 'string' && data.name.trim()) {
    categoria.nombre = data.name.trim();
  }

  if (typeof data.image === 'string') {
    categoria.imagen = data.image.trim();
  }

  if (typeof data.isActive === 'boolean') {
    categoria.activa = data.isActive;
  }

  if (typeof data.slug === 'string' && data.slug.trim()) {
    const candidate = slugify(data.slug.trim());
    if (candidate && !state.categorias.some((item) => item.slug === candidate && item.id !== categoria.id)) {
      categoria.slug = candidate;
    }
  }

  if (oldSlug !== categoria.slug) {
    state.productos.forEach((producto) => {
      if (producto.categoriaId === categoria.id || producto.categoriaSlug === oldSlug) {
        producto.categoriaSlug = categoria.slug;
        producto.categoriaId = categoria.id;
      }
    });
  }

  await syncToFirestore();
  return toPublicCategory(categoria);
}

async function deleteCategory(categoryId) {
  await ensureInitialized();

  const categoria = state.categorias.find((item) => item.id === categoryId);
  if (!categoria) return false;

  const removedProductIds = state.productos
    .filter((item) => item.categoriaId === categoryId)
    .map((item) => item.id);

  state.categorias = state.categorias
    .filter((item) => item.id !== categoryId)
    .map((item, index) => ({ ...item, orden: index + 1 }));

  state.productos = state.productos.filter((item) => item.categoriaId !== categoryId);

  await syncToFirestore();

  const db = getFirestore();
  if (db && state.usingFirestore) {
    const deleteTasks = [db.collection('categorias').doc(categoryId).delete().catch(() => null)];

    removedProductIds.forEach((id) => {
      deleteTasks.push(db.collection('productos').doc(id).delete().catch(() => null));
    });

    await Promise.all(deleteTasks);
  }

  return true;
}

async function reorderCategories(orderedIds) {
  await ensureInitialized();

  const ordered = [];
  const usedIds = new Set();

  for (const id of orderedIds) {
    const found = state.categorias.find((item) => item.id === id);
    if (found) {
      ordered.push(found);
      usedIds.add(found.id);
    }
  }

  for (const category of state.categorias) {
    if (!usedIds.has(category.id)) {
      ordered.push(category);
    }
  }

  state.categorias = ordered.map((item, index) => ({
    ...item,
    orden: index + 1
  }));

  await syncToFirestore();

  return state.categorias.map((item) => toPublicCategory(item));
}

async function createProduct(data) {
  await ensureInitialized();

  const name = String(data.name || '').trim();
  const categorySlug = String(data.categorySlug || '').trim();
  const price = Number(data.price);

  if (!name || !categorySlug || !Number.isFinite(price) || price < 0) {
    throw new Error('Nombre, categoria y precio valido son obligatorios');
  }

  const category = findCategoryBySlug(categorySlug);
  if (!category) {
    throw new Error('Categoria no encontrada');
  }

  const producto = normalizeProducto({
    id: crypto.randomUUID(),
    categoriaId: category.id,
    categoriaSlug: category.slug,
    nombre: name,
    descripcion: String(data.description || '').trim(),
    ingredientes: String(data.ingredients || '').trim(),
    imagen: String(data.image || '').trim(),
    precio: price,
    disponible: data.isAvailable !== false,
    destacado: data.isFeatured === true,
    vendidos: Number.isFinite(Number(data.soldCount)) ? Number(data.soldCount) : 0
  });

  state.productos.push(producto);
  await syncToFirestore();
  broadcastProductsSnapshot();

  return toPublicProduct(producto, category);
}

async function updateProduct(productId, data) {
  await ensureInitialized();

  const product = state.productos.find((item) => item.id === productId);
  if (!product) return null;

  if (typeof data.name === 'string' && data.name.trim()) {
    product.nombre = data.name.trim();
  }

  if (typeof data.description === 'string') {
    product.descripcion = data.description.trim();
  }

  if (typeof data.ingredients === 'string') {
    product.ingredientes = data.ingredients.trim();
  }

  if (typeof data.image === 'string') {
    product.imagen = data.image.trim();
  }

  if (Number.isFinite(Number(data.price)) && Number(data.price) >= 0) {
    product.precio = Number(data.price);
  }

  if (typeof data.isAvailable === 'boolean') {
    product.disponible = data.isAvailable;
  }

  if (typeof data.isFeatured === 'boolean') {
    product.destacado = data.isFeatured;
  }

  if (Number.isFinite(Number(data.soldCount)) && Number(data.soldCount) >= 0) {
    product.vendidos = Number(data.soldCount);
  }

  if (typeof data.categorySlug === 'string' && data.categorySlug.trim()) {
    const category = findCategoryBySlug(data.categorySlug.trim());
    if (category) {
      product.categoriaSlug = category.slug;
      product.categoriaId = category.id;
    }
  }

  await syncToFirestore();
  broadcastProductsSnapshot();

  const category = findCategoryBySlug(product.categoriaSlug);
  return toPublicProduct(product, category);
}

async function deleteProduct(productId) {
  await ensureInitialized();

  const exists = state.productos.some((item) => item.id === productId);
  if (!exists) return false;

  state.productos = state.productos.filter((item) => item.id !== productId);
  await syncToFirestore();
  broadcastProductsSnapshot();

  const db = getFirestore();
  if (db && state.usingFirestore) {
    await db.collection('productos').doc(productId).delete().catch(() => null);
  }

  return true;
}

async function updateDeliveryCost(deliveryCost) {
  await ensureInitialized();
  state.configuracion.costoDelivery = Number(deliveryCost);
  await syncToFirestore();
  return {
    deliveryCost: state.configuracion.costoDelivery
  };
}

async function updateStoreSchedule(schedulePayload) {
  await ensureInitialized();
  state.configuracion.horario = normalizeSchedule(schedulePayload || {});
  await syncToFirestore();
  return normalizeSchedule(state.configuracion.horario);
}

async function registerOrderSale(items) {
  await ensureInitialized();

  const salesMap = new Map();
  for (const item of items) {
    const productId = String(item.productId || '');
    const qty = Number(item.quantity) || 0;
    if (!productId || qty <= 0) continue;
    salesMap.set(productId, (salesMap.get(productId) || 0) + qty);
  }

  if (!salesMap.size) return;

  for (const product of state.productos) {
    if (salesMap.has(product.id)) {
      product.vendidos += salesMap.get(product.id);
    }
  }

  await syncToFirestore();
  broadcastProductsSnapshot();
}

module.exports = {
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicProductsByCategorySlug,
  getPublicProducts,
  getPublicProductById,
  subscribePublicProducts,
  getPublicDeliverySettings,
  getPublicStoreStatus,
  getAdminSnapshot,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateDeliveryCost,
  updateStoreSchedule,
  registerOrderSale
};
