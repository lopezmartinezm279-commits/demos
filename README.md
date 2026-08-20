# Escaparate de demos — Estudio Web López

Escaparate comercial estático: una portada (`index.html`) y **10 demos completas de webs por sector**
(reformas, clínica estética, placas solares, taller, inmobiliaria, dentista, fisio, abogados, barbería
y restaurante). Cada demo es un negocio **ficticio** de Sevilla con diseño propio, y todas comparten
los mismos cimientos de CSS/JS. Sirve para enseñar en reuniones (sobre todo desde el móvil) el nivel
de acabado y la automatización de WhatsApp que se ofrece.

**No hay build step ni dependencias.** Es HTML, CSS y JS plano. Nada que instalar ni compilar.

## Árbol de ficheros

```
demopaginasweb/
├── index.html            ← portada del escaparate
├── favicon.svg
├── README.md
├── reformas.html         ← 10 demos de sector
├── clinicas.html
├── solar.html
├── taller.html
├── inmobiliaria.html
├── dentista.html
├── fisio.html
├── abogados.html
├── barberia.html
├── restaurante.html
└── assets/
    ├── css/
    │   ├── base.css      ← componentes compartidos (agnóstico de color)
    │   └── themes.css    ← paleta y tipografía de cada sector (body.theme-<slug>)
    └── js/
        └── app.js        ← todo el JS: demobar, FAB de WhatsApp, formularios, filtros…
```

## Probarlo en local

Opción rápida: abre `index.html` con doble clic en el navegador. Todo funciona en `file://`.

Mejor con un servidor local (rutas y cachés más fieles a producción):

```bash
cd demopaginasweb
python -m http.server 8000
# → http://localhost:8000
```

## Desplegar en Vercel (tres maneras)

1. **Arrastrar la carpeta**: entra en [vercel.com/new](https://vercel.com/new), arrastra la carpeta
   `demopaginasweb` al navegador y listo. Framework preset: *Other* (es un sitio estático).
2. **CLI**: desde la carpeta del proyecto ejecuta `npx vercel` (y `npx vercel --prod` para producción).
   Acepta los valores por defecto; no hay comando de build ni carpeta de salida que configurar.
3. **GitHub**: sube la carpeta a un repositorio y en [vercel.com/new](https://vercel.com/new) importa
   el repo. Cada `git push` publica automáticamente.

## Dónde se cambia cada cosa

- **Número de WhatsApp**: constante `WA_PHONE` al principio de `assets/js/app.js`
  (formato internacional sin `+`, p. ej. `34692203981`). Ese número lo usan el FAB, los botones
  "Me interesa" y los enlaces generados. Los enlaces `https://wa.me/...` escritos a mano en
  `index.html` (hero y CTA final) se cambian ahí mismo.
- **Textos, precios y mensajes por sector**: cada demo vive entera en su `.html` de la raíz
  (títulos, servicios, precios, reseñas, horarios). El mensaje que precarga WhatsApp en cada
  página está en el atributo `data-wa` del `<body>`.
- **Colores y tipografías de un sector**: bloque `body.theme-<slug>` en `assets/css/themes.css`.
- **Teléfono/email visibles**: en el footer de cada página (`692 20 31 98`, `hola@<negocio>.es`).

> Nota: todas las imágenes son placeholders de `picsum.photos`. Al adaptar una demo a un cliente
> real, sustitúyelas por fotos reales manteniendo `width`, `height`, `alt` y `loading="lazy"`.
