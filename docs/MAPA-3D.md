# Mapa 3D de ejemplo
Módulo propio para Espacio para Agentes Dots+N8N. Código nuevo bajo MIT, sujeto a la licencia del proyecto.

## Uso
Abrir desktop/map3d/index.html con un navegador. Los tres archivos index.html, graph.js y view.js deben permanecer juntos. No instala librerías ni llama a internet. No necesita n8n, cuenta o API.

## Integración incluida
El módulo se encuentra en `desktop/map3d/` y está enlazado desde el escritorio. El servidor permite únicamente las tres rutas estáticas del módulo. También funciona al abrir el HTML directamente.
Los datos de `graph.js` son ficticios. No se importan notas ni conversaciones y los nodos no representan telemetría o agentes conectados. No es un clon de Obsidian ni depende de su software, marcas o recursos.

## Capacidades
Proyección perspectiva en Canvas 2D de posiciones tridimensionales. Rotación, zoom, búsqueda sin acentos, selección de nodos y vecinos, vista plana, controles de teclado y lista con toda la información textual. Sin animación automática. El control de zoom está acotado.

## Verificación
`node tests/map3d.cjs` comprueba datos, enlaces, búsqueda y proyección; `node --check desktop/map3d/view.js` verifica sintaxis.
La captura de Chromium no pudo ejecutarse en este entorno por restricción de sockets; no se afirma validación visual ni prueba real con lector de pantalla.
