# Validación de la versión preliminar 0.2.0-pre

El repositorio del proyecto ya es público. Este documento describe las pruebas del paquete integrado 0.2.0-pre y sus límites; no anuncia que una actualización se haya desplegado hasta verificar su publicación.

## Pruebas ejecutadas

`npm test` en el entorno Linux de preparación: suite base de 44 comprobaciones aprobadas, más pruebas del núcleo del taller local, rutas, datos/proyección/búsqueda/relaciones del mapa e integración. No se descargaron paquetes npm.

La suite base incluye casos de notas, entradas inválidas, destinos/saltos/confirmación, duplicados del mismo lote, resultado sin acción externa, dos workflows inactivos con nodos permitidos, coincidencia del código JSON con fuentes, ocho vistas con apertura/cierre/foco en DOM simulado y comprobación de ausencia de red/secretos comunes en HTML.

El taller local y el mapa 3D están enlazados desde el escritorio. Las pruebas del taller comprueban transformación y exportación; las del mapa comprueban datos, enlaces, búsqueda y proyección.

Servidor local probado mediante HTTP: las páginas y scripts del escritorio, taller y mapa devuelven 200; `/.env`, documentos y rutas fuera de la lista permitida devuelven 404. El servidor escucha solo en `127.0.0.1`. El rechazo de POST con 405 también se comprobó durante la preparación de la versión anterior.

## Límites y verificaciones pendientes

Un análisis de patrones no garantiza ausencia absoluta de secretos. Las pruebas de DOM simulado y lógica no sustituyen una revisión visual en navegador ni pruebas con lectores de pantalla. No se ejecutó importación en una instancia real de n8n. No hay integración operativa automática entre el escritorio y n8n.

Pendientes para mejorar esta versión preliminar pública:
- [ ] Abrir escritorio, taller y mapa en Chrome/Edge y Firefox, a 390 px y 1280 px.
- [ ] Recorrer ventanas, teclado, selección del mapa y exportación del taller en navegador real.
- [ ] Verificar importación y ejecución manual de ambos flujos en n8n de prueba; anotar versión.
- [ ] Configurar y verificar un canal privado para reportes sensibles antes de anunciarlo.
- [ ] Revisar cada paquete final y verificar su contenido remoto después de publicar la actualización.

La preparación de este paquete no modifica servicios privados. La existencia del repositorio público no convierte las funciones ilustrativas en conexiones operativas.
