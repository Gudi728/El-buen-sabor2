document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-loader');

  const hideSplash = () => {
    if (!splash) return;
    splash.classList.add('hide');
    window.setTimeout(() => {
      splash.remove();
    }, 350);
  };

  window.setTimeout(hideSplash, 900);

  const instagramHandle = document.getElementById('instagram-handle');
  const whatsappNumber = document.getElementById('whatsapp-number');
  const storeStatusPanel = document.getElementById('store-status-panel');
  const storeStatusLabel = document.getElementById('store-status-label');
  const storeScheduleText = document.getElementById('store-schedule-text');
  const storeClosedMessage = document.getElementById('store-closed-message');
  const settingsFab = document.getElementById('settings-fab');
  const menuButton = document.getElementById('menu-button');

  function wireAdminFabFallback() {
    if (!settingsFab) return;

    settingsFab.addEventListener('click', async (event) => {
      const defaultUrl = `${window.location.origin}/admin`;
      const fallbackUrl = 'http://localhost:3000/admin';

      if (window.location.origin === 'http://localhost:3000') {
        settingsFab.href = defaultUrl;
        return;
      }

      event.preventDefault();

      try {
        const response = await fetch(`${window.location.origin}/api/health`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          window.location.assign(defaultUrl);
          return;
        }
      } catch (error) {
        // Ignorar y usar fallback local.
      }

      window.location.assign(fallbackUrl);
    });
  }

  function wireMenuButton() {
    if (!menuButton) return;

    menuButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const defaultUrl = `${window.location.origin}/categoria`;
      const fallbackUrl = 'http://localhost:3000/categoria';

      if (window.location.origin === 'http://localhost:3000') {
        window.location.assign(defaultUrl);
        return;
      }

      try {
        const response = await fetch(`${window.location.origin}/api/health`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          window.location.assign(defaultUrl);
          return;
        }
      } catch (error) {
        // Ignorar y usar fallback local.
      }

      window.location.assign(fallbackUrl);
    });
  }

  function renderStoreStatus(data) {
    if (!storeStatusPanel || !storeStatusLabel || !storeScheduleText || !storeClosedMessage) return;

    const isOpen = data?.isOpen === true;
    storeStatusPanel.classList.toggle('open', isOpen);
    storeStatusPanel.classList.toggle('closed', !isOpen);
    storeStatusLabel.textContent = data?.statusLabel || (isOpen ? 'Abierto ahora' : 'Cerrado');
    storeScheduleText.textContent = data?.scheduleText || 'Horario de atencion no disponible';

    if (isOpen) {
      storeClosedMessage.classList.add('d-none');
      storeClosedMessage.textContent = '';
      return;
    }

    storeClosedMessage.classList.remove('d-none');
    storeClosedMessage.textContent =
      data?.closedMessage || 'En este momento no estamos tomando pedidos. Volveremos a abrir pronto.';
  }

  fetch('/api/local/status')
    .then((response) => response.json())
    .then((payload) => {
      if (!payload?.ok || !payload?.data) return;
      renderStoreStatus(payload.data);
    })
    .catch(() => {
      renderStoreStatus({
        isOpen: false,
        statusLabel: 'Estado no disponible',
        scheduleText: 'No se pudo cargar el horario.',
        closedMessage: ''
      });
    });

  fetch('/api/contacto')
    .then((response) => response.json())
    .then((payload) => {
      if (!payload?.ok || !payload?.data) return;

      if (instagramHandle && payload.data.instagram) {
        instagramHandle.textContent = payload.data.instagram;
      }

      if (whatsappNumber && payload.data.whatsapp) {
        whatsappNumber.textContent = payload.data.whatsapp;
      }
    })
    .catch(() => {
      // Fallback silencioso a los datos definidos en el HTML
    });

  wireAdminFabFallback();
  wireMenuButton();
});
