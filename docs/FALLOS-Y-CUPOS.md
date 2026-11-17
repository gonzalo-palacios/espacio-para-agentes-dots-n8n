# Fallos de conexión, resultados inciertos y cupos

## Alcance de este paquete

Esta demo no incorpora un agente de compras, cuentas de proveedores, llamadas pagas ni un contador de cupos. El puente local usa una dirección IP loopback fija: no depende de resolver nombres DNS. No trasladar exports ni incidentes privados a este repositorio.

## Corrección del puente local

Si falla el transporte o se corta la lectura de respuesta, el cliente indica **resultado desconocido**, oculta detalles internos y no reintenta. Un timeout o una desconexión no demuestra que el servidor no haya procesado la petición. Revisar la ejecución en la instancia de laboratorio antes de repetir manualmente. La CLI también advierte esto si el servidor devuelve una respuesta no válida.

Las pruebas cubren errores sintéticos EAI_AGAIN, ECONNRESET y ETIMEDOUT sin red, lectura interrumpida y una sola tentativa; el test HTTP local comprueba además timeout y redirecciones bloqueadas. Es una comprobación del cliente, no una certificación de n8n ni de un proveedor externo.

## Requisitos para una futura integración con gastos

- Separar estado de conexión, ejecución, reserva de presupuesto, consumo contabilizado y cargo confirmado por el proveedor.
- Validar entrada y autorización antes de reservar; la reserva debe ser atómica y asociada a una clave de idempotencia persistente, no a la memoria del navegador.
- Un chequeo previo sin credenciales puede detectar una caída presente antes de reservar. **No garantiza** la siguiente llamada ni autentica la cuenta: un HTTP 401 solo prueba que un servidor respondió.
- Un fallo inequívoco previo al envío puede liberar una reserva mediante transición atómica e idempotente, conservando evidencia. Un fallo ambiguo tras enviar debe quedar pendiente de conciliación: no liberar ni repetir automáticamente.
- No registrar un cupo técnico como dinero facturado. La ausencia de tokens o de respuesta no acredita cargo cero. No ampliar presupuestos para ocultar un error.
- Si el control de gastos devuelve 403, registrar que la conciliación está bloqueada. No interpretar como consumo cero ni ampliar permisos automáticamente.
- Probar primero sin servicios pagos: error antes del envío, timeout después de procesar, duplicados, concurrencia, reinicio, respuesta tardía y conciliación repetida. Verificar que no hay doble ejecución ni doble liberación.

Estos controles son requisitos de diseño, **no están implementados** en los workflows educativos. Una integración real necesita revisión y pruebas independientes antes de usar datos, dinero o credenciales.
