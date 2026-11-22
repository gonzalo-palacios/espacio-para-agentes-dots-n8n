# Puente local experimental hacia n8n

**Actualización 22/11/2026:** el nuevo modo conectado ya fue validado de extremo a extremo con n8n 2.14.2 local. Ver [CONEXION-LOCAL.md](CONEXION-LOCAL.md). Esta guía conserva el procedimiento experimental anterior por consola y URL de prueba; no confundirlo con el iniciador `INICIAR_CON_N8N.cmd`, que usa una instancia dedicada, webhook publicado solo en loopback y límite de 20 segundos.

Primer cliente HTTP real, **no una integración validada en n8n todavía**. No conecta el escritorio a agentes ni añade IA. Está separado de los dos workflows manuales existentes.

## Diseño

El navegador permanece estático. Un comando explícito envía únicamente dos tareas ficticias a `http://127.0.0.1:5678/webhook-test/dots-community-demo`. No acepta URL, archivos, notas del usuario, credenciales ni host remoto. No hay DNS, proxy de aplicación, redirecciones, reintentos ni guardado del resultado. Limita tiempo a 5 segundos y respuesta a 16 KiB; solo imprime campos del contrato esperado. La respuesta puede contener campos extra, pero se descartan antes de mostrarla.

Esto evita crear un proxy arbitrario desde el escritorio o introducir endpoints mutadores accesibles por otras páginas. No es autenticación del servicio local: otro proceso del mismo equipo podría ocupar el puerto. Usar solo una instancia de laboratorio propia y revisar el workflow antes de ejecutar. No usar una instancia productiva, pública, del VPS ni un túnel SSH.

**`active: false` no protege el webhook ni constituye un control de acceso.** Al pulsar Listen for Test Event, la URL de prueba puede recibir solicitudes aunque el workflow esté inactivo. Es obligatorio que la instancia de laboratorio escuche únicamente en loopback (`127.0.0.1`), sin exposición en `0.0.0.0`, interfaces de red, proxies públicos ni túneles. Que este cliente use loopback no restringe por sí mismo dónde escucha n8n. Verificar esa configuración antes de iniciar la escucha; si no se puede comprobar, no ejecutar la prueba.

## Prueba manual cuando haya n8n aislado

1. Tener una instancia de laboratorio n8n publicada solo en loopback del mismo equipo. Este paquete **no instala n8n ni modifica Docker/firewall**.
2. Importar `examples/local-bridge/workflow.json`. No activarlo ni publicarlo; revisar que contiene únicamente Webhook y Code, sin credenciales ni servicios externos.
3. En el nodo Webhook elegir la URL de prueba y pulsar **Listen for Test Event**. Comprobar que es exactamente la ruta indicada, con método POST y respuesta al terminar el último nodo (primer JSON).
4. Ejecutar `npm run n8n:preview`. No hace ninguna solicitud; muestra destino y datos ficticios.
5. Ejecutar `node src/local-bridge.cjs --send-demo`. Si el laboratorio usa otro puerto, añadir `--port=5679` (solo cambia el puerto, no el host ni la ruta).
6. Debe devolver `mode: demo` y las dos tareas `Comprar papel`, `Revisar inventario`. Si falla, no se reintenta ni se usa la URL productiva automáticamente.
7. Terminar la escucha de prueba y retirar el workflow del laboratorio si ya no se necesita. n8n puede conservar ejecuciones: los datos de este ejemplo son ficticios.

## Qué se verificó

- Payload fijo, puerto validado, confirmación necesaria, método POST y prohibición de redirects.
- Rechazo de respuestas inválidas y de errores HTTP sin imprimir cuerpos.
- Pruebas permanentes con HTTP real: respuesta mayor de 16 KiB rechazada, redirección 302 sin visitar su destino y servidor sin respuesta abortado a los 5 segundos (con tolerancia de reloj en el test).
- Petición HTTP real contra servidor de contrato local; ejecuta el código del workflow pero **no emula todo n8n**.
- Suite existente permanece aprobada.

**No verificado:** importación y ejecución en una instalación n8n real. No anunciar compatibilidad integral hasta comprobarla. La documentación oficial usada para Test URL y respuesta del último nodo: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## Próximo paso

Revisión de seguridad independiente y ejecución real en n8n aislado. Solo después evaluar una UI con confirmación explícita y autenticación adecuada. No habilitar por defecto una conexión a servicios personales.
