# El Buen Sabor - Rotiseria Web

Aplicacion web completa para El Buen Sabor con frontend, backend Node.js y Firebase.

## Importante sobre GitHub Pages

Este proyecto no funciona completo en GitHub Pages porque necesita backend (Express + API + Firebase Admin).

Si queres que funcione todo (home, categoria, carrito, admin y APIs), desplegalo como servicio Node en Render o Railway.

## Stack

- Frontend: HTML5, CSS3, JavaScript ES6+, Bootstrap 5, Font Awesome, Google Fonts
- Backend: Node.js, Express.js
- Base de datos: Firebase Firestore
- Imagenes: Firebase Storage

## Estructura

- config: configuraciones globales (entorno y Firebase)
- controllers: controladores HTTP
- routes: definicion de rutas web y API
- middleware: control de errores y 404
- services: logica de negocio
- models: estructuras/modelos del dominio
- utils: utilidades reutilizables
- public: assets estaticos (css, js, img)
- views: vistas HTML

## Requisitos

- Node.js 20+

## Ejecucion local

1. Instalar dependencias:

   npm install

2. Crear archivo de entorno desde plantilla:

   cp .env.example .env

   En Windows PowerShell:

   Copy-Item .env.example .env

3. Completar variables Firebase en .env

4. Iniciar:

   npm run dev

5. Abrir:

   http://localhost:3000

## Deploy completo en Render

Este repositorio ya incluye render.yaml.

1. En Render, usar "New +" -> "Blueprint" y seleccionar este repo.
2. Render va detectar render.yaml automaticamente.
3. Completar todas las variables de entorno pedidas.
4. Deploy.
5. Abrir la URL publica de Render (esa sera tu sitio completo en produccion).

## Variables de entorno

Ver plantilla en .env.example.

Variables requeridas:

- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_STORAGE_BUCKET
- PUBLIC_FIREBASE_API_KEY
- PUBLIC_FIREBASE_AUTH_DOMAIN
- PUBLIC_FIREBASE_PROJECT_ID
- PUBLIC_FIREBASE_STORAGE_BUCKET
- PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- PUBLIC_FIREBASE_APP_ID

## Endpoints

- GET /api/health
- GET /api/contacto
- GET /api/categorias
- GET /api/categorias/:slug
- GET /api/categorias/:slug/productos
