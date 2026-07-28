(function initAppHelpers(global) {
  const MAX_TEXT_LENGTH = 250;

  function sanitizeText(value, maxLength = MAX_TEXT_LENGTH) {
    return String(value || '').trim().slice(0, maxLength);
  }

  function isValidPhone(value) {
    const clean = sanitizeText(value, 30);
    return /^[0-9+\-\s]{8,20}$/.test(clean);
  }

  function isNonNegativeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0;
  }

  function isValidUrl(value) {
    const text = sanitizeText(value, 500);
    if (!text) return false;

    try {
      const parsed = new URL(text);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (error) {
      return false;
    }
  }

  function debounce(fn, waitMs) {
    let timer = null;

    return function debounced(...args) {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        fn.apply(this, args);
      }, waitMs);
    };
  }

  function getStoredArray(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function setStoredArray(storageKey, value) {
    const payload = Array.isArray(value) ? value : [];
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  async function requestJson(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.message || 'Error de servidor');
    }

    return payload;
  }

  function createToast(toastElement, bodyElement) {
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

    return {
      show(message) {
        if (!toast || !bodyElement) return;
        bodyElement.textContent = message;
        toast.show();
      }
    };
  }

  function runAsync(handler, onError) {
    return async function wrappedHandler(...args) {
      try {
        await handler(...args);
      } catch (error) {
        if (typeof onError === 'function') {
          onError(error);
        }
      }
    };
  }

  global.AppHelpers = {
    sanitizeText,
    isValidPhone,
    isNonNegativeNumber,
    isValidUrl,
    debounce,
    getStoredArray,
    setStoredArray,
    requestJson,
    createToast,
    runAsync
  };
})(window);
