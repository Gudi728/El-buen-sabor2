document.addEventListener('DOMContentLoaded', () => {
  const {
    sanitizeText,
    isValidPhone,
    getStoredArray,
    setStoredArray,
    requestJson,
    createToast
  } = window.AppHelpers;

  const CART_STORAGE_KEY = 'ebs_cart_v1';
  const WHATSAPP_TARGET = '3533514960';

  const cartItemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('empty-cart');
  const subtotalAmount = document.getElementById('subtotal-amount');
  const deliveryAmount = document.getElementById('delivery-amount');
  const totalAmount = document.getElementById('total-amount');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const storeClosedBanner = document.getElementById('store-closed-banner');
  const cartStockBanner = document.getElementById('cart-stock-banner');
  const checkoutForm = document.getElementById('checkout-form');
  const confirmOrderBtn = document.getElementById('confirm-order-btn');
  const deliveryFields = document.getElementById('delivery-fields');
  const itemTemplate = document.getElementById('cart-item-template');
  const modalElement = document.getElementById('checkoutModal');
  const checkoutModal = modalElement ? new bootstrap.Modal(modalElement) : null;
  const clearCartModalElement = document.getElementById('clearCartModal');
  const clearCartModal = clearCartModalElement ? new bootstrap.Modal(clearCartModalElement) : null;
  const confirmClearCartBtn = document.getElementById('confirm-clear-cart-btn');
  const toastElement = document.getElementById('cart-toast');
  const toastBody = document.getElementById('cart-toast-body');
  const toastNotifier = createToast(toastElement, toastBody);

  const customerNameInput = document.getElementById('customer-name');
  const customerLastnameInput = document.getElementById('customer-lastname');
  const customerPhoneInput = document.getElementById('customer-phone');
  const deliveryAddressInput = document.getElementById('delivery-address');
  const deliveryReferenceInput = document.getElementById('delivery-reference');
  const deliveryTimeInput = document.getElementById('delivery-time');
  const generalNotesInput = document.getElementById('general-notes');

  const orderTypeInputs = Array.from(document.querySelectorAll('input[name="orderType"]'));

  let currentOrderType = 'pickup';
  let currentSubtotal = 0;
  let currentDeliveryCost = 0;
  let currentTotal = 0;
  let configuredDeliveryCost = 0;
  let canPlaceOrders = true;
  let productAvailability = new Map();
  let availabilityStream = null;

  const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  function getCart() {
    return getStoredArray(CART_STORAGE_KEY);
  }

  function saveCart(cart) {
    setStoredArray(CART_STORAGE_KEY, cart);
  }

  function hasUnavailableItems(cart) {
    return cart.some((item) => item.isAvailable === false);
  }

  function refreshCheckoutAvailability(cart) {
    const hasItems = cart.length > 0;
    const hasUnavailable = hasUnavailableItems(cart);

    checkoutBtn.disabled = !hasItems || !canPlaceOrders || hasUnavailable;

    if (!cartStockBanner) return;

    if (!hasUnavailable) {
      cartStockBanner.classList.add('d-none');
      cartStockBanner.textContent = '';
      return;
    }

    const unavailableCount = cart.filter((item) => item.isAvailable === false).length;
    cartStockBanner.classList.remove('d-none');
    cartStockBanner.textContent =
      unavailableCount === 1
        ? 'Tienes 1 producto agotado en el carrito. Quitalo para poder confirmar el pedido.'
        : `Tienes ${unavailableCount} productos agotados en el carrito. Quita o reemplaza esos items para confirmar el pedido.`;
  }

  function syncCartAvailability() {
    const cart = getCart();
    let changed = false;

    for (const item of cart) {
      const nextAvailability = productAvailability.get(item.productId) !== false;
      if (item.isAvailable !== nextAvailability) {
        item.isAvailable = nextAvailability;
        changed = true;
      }
    }

    if (changed) {
      saveCart(cart);
    }

    render();
  }

  function applyProductsAvailability(products) {
    productAvailability = new Map(
      (Array.isArray(products) ? products : []).map((product) => [product.id, product.isAvailable !== false])
    );
    syncCartAvailability();
  }

  async function loadProductAvailabilitySnapshot() {
    try {
      const payload = await requestJson('/api/productos');
      applyProductsAvailability(payload?.data || []);
    } catch (error) {
      // Fallback silencioso; se mantiene el estado actual del carrito.
    }
  }

  function connectAvailabilityStream() {
    if (!window.EventSource) return;

    availabilityStream = new EventSource('/api/productos/stream');

    availabilityStream.addEventListener('products', (event) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        applyProductsAvailability(payload?.data?.products || []);
      } catch (error) {
        // Ignorar payload invalido.
      }
    });

    window.addEventListener('beforeunload', () => {
      if (availabilityStream) {
        availabilityStream.close();
        availabilityStream = null;
      }
    });
  }

  async function loadDeliveryCost() {
    try {
      const payload = await requestJson('/api/settings/delivery');
      const parsedCost = Number(payload?.data?.deliveryCost);
      configuredDeliveryCost = Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost : 0;
      updateTotals(getCart());
    } catch (error) {
      configuredDeliveryCost = 0;
    }
  }

  async function loadStoreStatus() {
    try {
      const payload = await requestJson('/api/local/status');
      const data = payload?.data || {};

      canPlaceOrders = data.canPlaceOrders !== false;
      refreshCheckoutAvailability(getCart());

      if (!storeClosedBanner) return;

      if (canPlaceOrders) {
        storeClosedBanner.classList.add('d-none');
        storeClosedBanner.textContent = '';
      } else {
        storeClosedBanner.classList.remove('d-none');
        storeClosedBanner.textContent =
          data.closedMessage || 'El local esta cerrado en este momento. No se pueden confirmar pedidos.';
      }
    } catch (error) {
      canPlaceOrders = true;
      refreshCheckoutAvailability(getCart());
      if (storeClosedBanner) {
        storeClosedBanner.classList.add('d-none');
      }
    }
  }

  function formatNote(note) {
    return note ? `Observaciones: ${note}` : 'Observaciones: sin observaciones';
  }

  function showToast(message) {
    toastNotifier.show(message);
  }

  function getSelectedOrderType() {
    const selected = orderTypeInputs.find((input) => input.checked);
    return selected ? selected.value : 'pickup';
  }

  function updateDeliveryFieldVisibility() {
    currentOrderType = getSelectedOrderType();
    const deliveryMode = currentOrderType === 'delivery';
    deliveryFields.classList.toggle('d-none', !deliveryMode);

    deliveryAddressInput.required = deliveryMode;
    deliveryReferenceInput.required = deliveryMode;
    deliveryTimeInput.required = deliveryMode;

    updateTotals(getCart());
  }

  function markInvalid(input, isInvalid) {
    input.classList.toggle('is-invalid', isInvalid);
  }

  function validateCheckout() {
    const name = sanitizeText(customerNameInput.value);
    const lastName = sanitizeText(customerLastnameInput.value);
    const phone = sanitizeText(customerPhoneInput.value, 30);
    const orderType = getSelectedOrderType();

    let valid = true;

    const phoneValid = isValidPhone(phone);
    markInvalid(customerNameInput, !name);
    markInvalid(customerLastnameInput, !lastName);
    markInvalid(customerPhoneInput, !phoneValid);

    if (!name || !lastName || !phoneValid) valid = false;

    if (orderType === 'delivery') {
      const address = sanitizeText(deliveryAddressInput.value, 220);
      const reference = sanitizeText(deliveryReferenceInput.value, 220);
      const time = sanitizeText(deliveryTimeInput.value, 10);

      markInvalid(deliveryAddressInput, !address);
      markInvalid(deliveryReferenceInput, !reference);
      markInvalid(deliveryTimeInput, !time);

      if (!address || !reference || !time) valid = false;
    } else {
      markInvalid(deliveryAddressInput, false);
      markInvalid(deliveryReferenceInput, false);
      markInvalid(deliveryTimeInput, false);
    }

    return valid;
  }

  function buildWhatsappMessage(orderData) {
    const lines = [];
    lines.push('*Nuevo pedido - El Buen Sabor*');
    lines.push('');
    lines.push(`Nombre: ${orderData.name}`);
    lines.push(`Apellido: ${orderData.lastName}`);
    lines.push(`Telefono: ${orderData.phone}`);
    lines.push(`Modalidad: ${orderData.orderType === 'delivery' ? 'Delivery' : 'Retira en el local'}`);
    lines.push('');
    lines.push('*Productos*');

    orderData.cart.forEach((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      lines.push(
        `${index + 1}. ${item.name} x${item.quantity} - ${money.format(item.price)} c/u - Subtotal ${money.format(itemSubtotal)}`
      );
      lines.push(`   ${formatNote(item.note)}`);
    });

    lines.push('');
    lines.push(`Subtotal: ${money.format(orderData.subtotal)}`);
    lines.push(`Delivery: ${money.format(orderData.deliveryCost)}`);
    lines.push(`Total: ${money.format(orderData.total)}`);
    lines.push(`Hora solicitada: ${orderData.deliveryTime || 'Sin horario especifico'}`);

    if (orderData.orderType === 'delivery') {
      lines.push(`Direccion: ${orderData.address}`);
      lines.push(`Referencia: ${orderData.reference}`);
    }

    lines.push(`Observaciones generales: ${orderData.generalNotes || 'Sin observaciones generales'}`);
    return lines.join('\n');
  }

  function sendOrderToWhatsapp(orderData) {
    const message = buildWhatsappMessage(orderData);
    const url = `https://wa.me/${WHATSAPP_TARGET}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function persistOrder(orderData) {
    const payload = await requestJson('/api/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: orderData.name,
        lastName: orderData.lastName,
        phone: orderData.phone,
        orderType: orderData.orderType,
        items: orderData.cart,
        deliveryAddress: orderData.address,
        deliveryReference: orderData.reference,
        desiredTime: orderData.deliveryTime,
        generalNotes: orderData.generalNotes
      })
    });

    return payload.data;
  }

  function updateTotals(cart) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery = currentOrderType === 'delivery' ? configuredDeliveryCost : 0;
    const total = subtotal + delivery;

    currentSubtotal = subtotal;
    currentDeliveryCost = delivery;
    currentTotal = total;

    subtotalAmount.textContent = money.format(subtotal);
    deliveryAmount.textContent = money.format(delivery);
    totalAmount.textContent = money.format(total);
  }

  function render() {
    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (!cart.length) {
      emptyState.classList.remove('d-none');
      updateTotals([]);
      refreshCheckoutAvailability([]);
      return;
    }

    emptyState.classList.add('d-none');

    cart.forEach((item) => {
      const node = itemTemplate.content.cloneNode(true);
      const article = node.querySelector('.cart-item');
      const image = node.querySelector('.cart-item-image');
      const category = node.querySelector('.cart-item-category');
      const name = node.querySelector('.cart-item-name-text');
      const note = node.querySelector('.cart-item-note');
      const stockBadge = node.querySelector('.cart-item-stock-badge');
      const stockMessage = node.querySelector('.cart-item-stock-message');
      const unitPrice = node.querySelector('.cart-item-unit-price');
      const subtotal = node.querySelector('.cart-item-subtotal');
      const quantity = node.querySelector('.quantity-value');
      const decreaseBtn = node.querySelector('.decrease-btn');
      const increaseBtn = node.querySelector('.increase-btn');
      const removeBtn = node.querySelector('.remove-btn');

      article.dataset.itemId = item.itemId;
      image.src = item.image;
      image.alt = item.name;
      category.textContent = item.categoryName || 'Producto';
      name.textContent = item.name;
      note.textContent = formatNote(item.note);

      const unavailable = item.isAvailable === false;
      article.classList.toggle('is-out-of-stock', unavailable);
      stockBadge.classList.toggle('d-none', !unavailable);
      stockMessage.classList.toggle('d-none', !unavailable);

      decreaseBtn.disabled = unavailable;
      increaseBtn.disabled = unavailable;

      unitPrice.textContent = `Precio unitario: ${money.format(item.price)}`;
      subtotal.textContent = `Subtotal: ${money.format(item.price * item.quantity)}`;
      quantity.textContent = String(item.quantity);

      decreaseBtn.addEventListener('click', () => changeQuantity(item.itemId, -1));
      increaseBtn.addEventListener('click', () => changeQuantity(item.itemId, 1));
      removeBtn.addEventListener('click', () => removeItem(item.itemId));

      cartItemsContainer.appendChild(node);
    });

    updateTotals(cart);
    refreshCheckoutAvailability(cart);
  }

  function changeQuantity(itemId, delta) {
    const cart = getCart();
    const item = cart.find((cartItem) => cartItem.itemId === itemId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      const updatedCart = cart.filter((cartItem) => cartItem.itemId !== itemId);
      saveCart(updatedCart);
    } else {
      saveCart(cart);
    }

    render();
  }

  function removeItem(itemId) {
    const cart = getCart().filter((item) => item.itemId !== itemId);
    saveCart(cart);
    render();
  }

  clearCartBtn.addEventListener('click', () => {
    const cart = getCart();
    if (!cart.length) return;
    clearCartModal.show();
  });

  confirmClearCartBtn.addEventListener('click', () => {
    saveCart([]);
    render();
    clearCartModal.hide();
    showToast('Carrito vaciado.');
  });

  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (!cart.length) return;
    if (!canPlaceOrders) {
      showToast('El local esta cerrado en este momento.');
      return;
    }

    if (hasUnavailableItems(cart)) {
      showToast('Hay productos agotados en tu carrito. Retiralos para continuar.');
      return;
    }

    updateDeliveryFieldVisibility();
    checkoutModal.show();
  });

  orderTypeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      updateDeliveryFieldVisibility();
    });
  });

  confirmOrderBtn.addEventListener('click', async () => {
    const cart = getCart();
    if (!cart.length) {
      checkoutModal.hide();
      return;
    }

    const valid = validateCheckout();
    if (!valid) return;

    if (!canPlaceOrders) {
      showToast('No se puede confirmar el pedido porque el local esta cerrado.');
      return;
    }

    if (hasUnavailableItems(cart)) {
      showToast('No se puede confirmar: tienes productos agotados en el carrito.');
      return;
    }

    const orderType = getSelectedOrderType();
    const orderData = {
      name: sanitizeText(customerNameInput.value, 80),
      lastName: sanitizeText(customerLastnameInput.value, 80),
      phone: sanitizeText(customerPhoneInput.value, 30),
      orderType,
      cart,
      subtotal: currentSubtotal,
      deliveryCost: orderType === 'delivery' ? currentDeliveryCost : 0,
      total: orderType === 'delivery' ? currentTotal : currentSubtotal,
      address: sanitizeText(deliveryAddressInput.value, 220),
      reference: sanitizeText(deliveryReferenceInput.value, 220),
      deliveryTime: sanitizeText(deliveryTimeInput.value, 10),
      generalNotes: sanitizeText(generalNotesInput.value, 320)
    };

    confirmOrderBtn.disabled = true;
    confirmOrderBtn.textContent = 'Procesando...';

    try {
      const saved = await persistOrder(orderData);

      sendOrderToWhatsapp({
        ...orderData,
        subtotal: saved.summary.subtotal,
        deliveryCost: saved.summary.deliveryCost,
        total: saved.summary.total
      });

      saveCart([]);
      render();
      checkoutModal.hide();
      showToast('Pedido registrado y enviado por WhatsApp.');
    } catch (error) {
      showToast(error.message || 'No se pudo confirmar el pedido.');
    } finally {
      confirmOrderBtn.disabled = false;
      confirmOrderBtn.textContent = 'Enviar por WhatsApp';
    }
  });

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  updateDeliveryFieldVisibility();
  connectAvailabilityStream();
  loadProductAvailabilitySnapshot();
  loadStoreStatus();
  loadDeliveryCost();

  render();
});
