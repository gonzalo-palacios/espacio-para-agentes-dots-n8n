# Validación de la versión 0.1.0-pre

Ejecutado: `npm test` en entorno Linux de preparación. 44 comprobaciones aprobadas. Servidor local probado con HTTP: GET / devuelve 200 y contenido exacto, GET /.env devuelve 404 y POST / devuelve 405. No hay paquetes npm descargados.

Incluye: cinco casos de notas, entradas inválidas, destinos/saltos/confirmación, duplicados del mismo lote, resultado sin acción externa, dos workflows inactivos con nodos permitidos, coincidencia del código JSON con fuentes, ocho vistas con apertura/cierre/foco en DOM simulado y comprobación de ausencia de red/secretos comunes en HTML.

Limitaciones: un análisis de patrones no garantiza ausencia absoluta de secretos. No se ejecutó importación en instancia real de n8n. No se validó visualmente todo el escritorio en navegador real. El mock DOM no sustituye lectores de pantalla ni un navegador.

Antes del lanzamiento público:
- [ ] Abrir desktop/index.html en Chrome/Edge y Firefox, a 390 px y 1280 px.
- [ ] Recorrer las ocho ventanas, Tab, Shift+Tab, Escape y cierre.
- [ ] Verificar importación y ejecución manual de ambos flujos en n8n de prueba; anotar versión.
- [ ] Verificar licencia final y canal privado de reportes con el propietario.
- [ ] Revisar contenido completo del ZIP y aprobación del propietario para publicación.

No se modificaron servicios privados ni se publicaron repositorios durante esta preparación.
