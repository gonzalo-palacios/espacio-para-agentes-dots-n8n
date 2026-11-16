# Un espacio que se sienta familiar

El escritorio clásico sigue siendo la vista inicial. En **Personalizar mi espacio** podés cambiar a **Inicio tipo celular**: una grilla de las mismas herramientas, con botones grandes y etiquetas visibles. No simula una conexión nueva con ChatGPT ni cambia las capacidades de los agentes.

## Personalización disponible

- Vista clásica o inicio tipo celular.
- Fondos Océano, Atardecer y Bosque, dibujados con CSS. Sin descargas ni imágenes de terceros.
- Iconos redondeados, cuadrados o circulares.
- Vista previa inmediata. **Guardar en este navegador** es una acción explícita.
- **Olvidar ajustes** borra solamente las preferencias de apariencia y restablece la vista inicial.

Solo se almacenan tres opciones enumeradas bajo `dots-n8n-appearance-v1` en `localStorage`. No se guardan notas, fotos, archivos, credenciales ni identificadores. Nada se envía a un servidor ni se sincroniza con otros dispositivos. Si el navegador bloquea el almacenamiento, la vista previa sigue funcionando; el mensaje indica si guardar o borrar falló.

## Accesibilidad y límites

Los controles tienen etiquetas, foco visible, tamaño táctil mínimo de 44 px y mensajes de estado. La grilla se adapta a pantallas pequeñas. Se conserva el diálogo existente con Escape y navegación de teclado. Estas comprobaciones de código no sustituyen una prueba manual con lector de pantalla.

No hay fondos personalizados, arrastrar iconos, instalación PWA ni app nativa en esta versión. Se evita así pedir permisos o subir archivos para una personalización simple.

## Verificación

`npm test` incluye pruebas de normalización, rechazo de valores desconocidos, guardado explícito, restauración, borrado y rutas. La interacción se prueba con DOM simulado. Antes de publicar, revisar visualmente en navegador real a 360 px y escritorio, con teclado, zoom 200% y almacenamiento bloqueado. La prueba real de navegador no se completó en el entorno de preparación porque Playwright no tenía su ejecutable y Chromium del sistema terminó al intentar iniciarlo.
