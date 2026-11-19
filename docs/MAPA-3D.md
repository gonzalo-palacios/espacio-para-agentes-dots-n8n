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

## Exploración enfocada
- Arrastre con un dedo o botón principal: orbitar en 3D. En 2D: desplazar.
- Shift + arrastre o Shift + flechas: desplazar. Flechas: orbitar (desplazar en 2D).
- Rueda, botones +/− o teclado +/−: zoom acotado. No hay pellizco multitáctil; los botones son la alternativa táctil.
- Seleccionar desde el mapa o lista centra el nodo y atenúa relaciones ajenas. Los botones de vecinos permiten continuar el recorrido.
- La búsqueda filtra la lista, pero conserva el contexto del mapa. El nodo Notas a tareas abre el taller local.
- Restablecer vista (tecla Inicio con foco en el mapa) recupera toda la escena y limpia búsqueda/selección.

Estética HUD original en azul noche, cian y ámbar. Sin logos, recursos de películas, dependencias, movimiento automático ni telemetría. La vista permanece estática con movimiento reducido. La lista y controles siguen disponibles sin arrastrar.

`node tests/map-interaction.cjs`: regresiones de selección/centrado, contexto de búsqueda, vecinos y taller, arrastre 2D, umbral acumulado, cancelación, punteros secundarios, teclado, reset y zoom. Usa DOM/Canvas simulados: no reemplaza pruebas manuales en navegador, móvil o lector de pantalla. Antes de aprobar visualmente, verificar estas interacciones y foco de teclado en el dispositivo destino.

## Verificación visual de esta revisión
Verificado por revisión visual en navegador cloud de escritorio: el mapa renderiza, se pueden seleccionar Notas a tareas y Jarvis, se muestran sus vínculos relacionados y funciona el botón Vista 2D. Se ejercitó el arrastre, pero no se realizó una comprobación visual independiente de su resultado. Quedan pendientes verificación visual del arrastre, móvil, lector de pantalla y apertura directa con `file://`. Las pruebas automatizadas con DOM simulado no sustituyen esas comprobaciones. Esta revisión no implica publicación ni despliegue del Espacio.
