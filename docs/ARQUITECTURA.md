# De la demo a una integración real

## Incluido

Navegador → interfaz local sin red.

n8n de prueba → inicio manual → datos ficticios → transformación determinista → salida visible en n8n.

Estos dos circuitos están separados. El escritorio **no invoca los workflows**. No hay agente IA ni modelo descargado.

## Integración futura, no implementada

Navegador → backend autenticado → validación/autorización del servidor → n8n → adaptador de agente/herramienta → auditoría → resultado.

Requisitos previos: identidad comprobada; autorización por acción y destino; protección CSRF; claves solo en servidor; límites de entrada y salida; lista cerrada de herramientas; cola con idempotencia persistente; máximo de saltos y reintentos; presupuestos calculados del lado servidor; manejo de errores y cancelación; registros sin secretos; TLS y acceso restringido.

Nunca confiar en el navegador o en un campo enviado por un modelo para autorizar una acción. No permitir shell, URLs arbitrarias ni herramientas descubiertas de forma automática. Una mención del coordinador no es un pedido.

No exponer Docker, Ollama, n8n ni el servidor demo directamente a Internet. No conectar cuentas reales hasta revisar permisos y pasar pruebas en entorno aislado. Los datos que se envíen a un proveedor de IA o voz requieren evaluación explícita de privacidad y costo.
