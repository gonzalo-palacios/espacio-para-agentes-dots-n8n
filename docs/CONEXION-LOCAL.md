# NOD conectado a n8n local

Validado el 22/11/2026 en Windows, Node.js 24.21.0 y n8n 2.14.2.

## Iniciar y usar

1. Cerrar una ejecución anterior de NOD si ocupa 8080.
2. Ejecutar `INICIAR_CON_N8N.cmd`, o `npm run start:connected` desde la raíz.
3. Esperar «NOD conectado». El primer inicio importa los workflows y puede demorar varios minutos.
4. Abrir `http://127.0.0.1:8080/connection.html`, también enlazado desde el escritorio.
5. Pulsar **Enviar prueba a n8n**. La respuesta correcta contiene `Comprar papel` y `Revisar inventario`.
6. Ctrl+C en la consola detiene el servidor de NOD y el proceso n8n creado por el iniciador. No cerrar otros procesos Node indiscriminadamente.

`npm start` conserva el modo estático. En ese modo la pantalla avisa que la conexión está deshabilitada. Abrir el HTML por archivo tampoco inicia n8n.

## Qué se conecta

Navegador → NOD local en 8080 → webhook de n8n en 5679 → nodo Code → respuesta JSON → pantalla de NOD.

La interfaz solo permite enviar el payload fijo de ejemplo. Las notas del taller permanecen en el navegador y no se transmiten. No hay IA, acceso a cuentas, gastos de API, compras ni comunicación con agentes reales.

Se importan tres workflows con IDs reservados al laboratorio: `NodLocalNotes01`, `NodLocalRouting02` y `NodLocalBridge01`. Solo el tercero se publica **en esa instancia local** para disponer de `/webhook/dots-community-demo` sin rearmar la escucha de prueba. Esto es el nombre de la ruta de ejecución de n8n: no representa un despliegue en Internet. Los dos ejemplos manuales siguen inactivos. Los JSON fuente conservan `active: false`.

## Aislamiento y datos

- Base, clave generada por n8n, logs y resultados: `private/n8n-local/`; todo está excluido de Git. No compartir esta carpeta ni sus logs completos.
- Servidor n8n: `127.0.0.1:5679`; broker JavaScript: `127.0.0.1:5680`; NOD: `127.0.0.1:8080`.
- El iniciador fija configuración propia y descarta variables heredadas de n8n/base de datos antes de lanzar su proceso.
- No importa credenciales ni modifica la carpeta habitual de n8n, Docker, firewall o VPS. No instala paquetes.
- La API de NOD valida Host, Origin y token temporal, admite solo `{}` y construye el payload fijo en el servidor. No habilita CORS, URLs arbitrarias ni entrada de notas. Limita concurrencia y repetición.
- Timeout del modo conectado: 20 segundos para tolerar arranque en frío. El cliente experimental anterior conserva 5 segundos y la ruta `/webhook-test` por defecto. Sin reintentos automáticos y con límite de respuesta de 16 KiB.
- El webhook directo de laboratorio no tiene credenciales: solo acepta los datos ficticios fijos y solo escucha en loopback. No sirve como base de autorización para acciones reales.

## Pruebas realizadas

`npm test`: lógica de la demo, taller, mapa, rutas, puente, apariencia y controles HTTP de conexión aprobados.

Ejecuciones en n8n real:

- Importación de los tres workflows y publicación local del puente verificadas mediante exportación.
- Notas: tres items; responsable y fecha sin inferir.
- Enrutamiento: un resultado simulado y otro bloqueado; ambos sin acción externa.
- NOD HTTP → n8n Webhook → Code → NOD: respuesta correcta con dos tareas, registrada el 22/11/2026 a las 12:35:52 de Argentina.
- Chrome real: botón «Enviar prueba a n8n», mensaje de éxito y dos tareas visibles. Captura local: `private/n8n-local/conexion-verificada.jpg`.

La evidencia local saneada está en `private/n8n-local/integration-result.json`. `npm run n8n:test` repite las ejecuciones manuales y la prueba HTTP, y detiene sus servicios al terminar. Ejecutarlo con el laboratorio anterior detenido. `npm run n8n:setup` reimporta las copias de estos tres workflows y publica el puente; usarlo tras cambiar el JSON, no para editar workflows personales.

## Problemas detectados y corregidos

1. Faltaba `webhookId` en el nodo importado. n8n registraba una ruta con prefijo de workflow/nodo y la URL prevista devolvía 404. Se añadió el identificador y una comprobación de regresión.
2. La primera ejecución real tardó unos 6,5 s. n8n la completó, pero el cliente original vencía a los 5 s. Se verificó el estado antes de repetir y se dio al modo conectado un límite de 20 s.

Ante «resultado incierto», comprobar la ejecución antes de repetir. No se puede deducir de un timeout que n8n no ejecutó el trabajo.

## Límites pendientes

La prueba conecta tareas ficticias. Enviar notas reales, persistir tareas, autenticar herramientas de agentes, integrar Shopper o conectar otra instancia requiere desarrollo y validación adicionales. El mapa y el taller siguen siendo módulos locales separados.

n8n informa que falta el entorno virtual del runner Python; estos workflows usan exclusivamente JavaScript y sus pruebas pasaron. No hace falta instalar Python para este alcance. No se completó todavía una revisión exhaustiva de móvil, lector de pantalla ni todos los controles visuales.

Referencias de n8n: [CLI del servidor](https://docs.n8n.io/hosting/cli-commands/) y [configuración de despliegue](https://docs.n8n.io/hosting/configuration/environment-variables/deployment/). Para compatibilidad se inspeccionaron además los comandos y helpers de la versión 2.14.2 instalada.
