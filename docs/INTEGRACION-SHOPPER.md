# Integración de evidencia con un modelo existente

Estado: prototipo de laboratorio. No instala un agente ni cambia su modelo, presupuesto, cupos, permisos o producción. El adaptador Node se ejecuta en un proceso confiable separado; **no debe pegarse en n8n Code ni habilitar require o Execute Command para usarlo**.

## Componentes

- `src/shopper-fetch.cjs`: adquisición HTTPS acotada para URLs completas de una allowlist definida por el operador.
- `src/shopper-offers.cjs`: extrae oferta principal de HTML ya capturado, sin red.
- `src/shopper-evidence-context.cjs`: hasta tres ofertas recientes y únicas, con procedencia autorizada; produce JSON de datos y una guía estática separada. No llama modelos.
- `workflows/03-compras-evidencia-offline.json`: subflujo n8n de extracción con entradas explícitas. La plantilla sigue inactiva.

## Flujo propuesto

Consulta autorizada → adquisición separada → extracción → revisión de evidencia/TTL → límites y cupos existentes → MISMO modelo, una petición autorizada → formateador con revisión humana.

La allowlist procede de configuración confiable, nunca de HTML, resultados de búsqueda ni argumentos del modelo. Si el modelo descubre una URL nueva, no se descarga automáticamente: queda candidata hasta revisión del operador. La consulta original debe seguir pasando exactamente las guardas existentes; agregar evidencia no debe reemplazar ni ampliar su ámbito autorizado. Si no hay evidencia válida, no hacer una llamada paga de “reparación”.

Para conexión futura al modelo, adjuntar `evidenceJson` como datos en el mensaje de usuario, manteniendo las instrucciones originales y añadiendo la guía estática mediante configuración confiable. No insertar texto web en instrucciones de sistema. No pasar HTML crudo, headers, cookies o campos arbitrarios. Separar datos e instrucciones reduce exposición pero NO garantiza inmunidad a prompt injection. No dar facultades de compra al modelo por añadir esta herramienta.

## Ejemplo de composición en proceso confiable

```js
const {createFetcher} = require('../src/shopper-fetch.cjs');
const {extractOffers} = require('../src/shopper-offers.cjs');
const {prepareEvidence} = require('../src/shopper-evidence-context.cjs');

// Ejemplo reservado, no oferta comercial. El operador elige las fuentes reales.
const allowedSourceUrls = ['https://shop.example.org/producto'];
const fetchHtml = createFetcher(allowedSourceUrls);
const captured = await fetchHtml(allowedSourceUrls[0]);
const extracted = extractOffers(captured);
const context = prepareEvidence([extracted], {allowedSourceUrls});
// Revisar context. NO se invoca una API ni se ejecuta una compra aquí.
```

El ejemplo requiere un contexto async. No es un endpoint público ni una herramienta MCP instalada. Integrar adquisición al hosting real requiere decidir un canal acotado entre el colector y n8n sin debilitar el sandbox. Las pruebas n8n existentes cubren datos ya adquiridos y subflujo JSON inline, no el despliegue del colector ni una petición al modelo.

## Controles y límites del adaptador

Allowlist exacta antes de DNS, solo HTTPS443 sin credenciales/fragmentos; resolución A/AAAA y rechazo si cualquier dirección es privada/reservada; dirección validada fijada en lookup de conexión, con TLS y nombre del host verificados. No sigue redirecciones ni reintenta. No toma cookies, Authorization, headers del usuario ni proxy ambiente. Acepta HTTP200 y HTML UTF8 sin compresión; tamaño máximo1000000bytes, tiempo total máximo10s, una solicitud simultánea y máximo tres intentos por instancia, también consumidos al fallar.

Estos controles son deliberadamente restrictivos. Algunos sitios legítimos quedan excluidos por redirección, compresión, formato, tamaño o red. No desactivar TLS, ampliar allowlist automáticamente, introducir proxy alternativo ni cambiar firewall/DNS para lograr una prueba. Registrar código de fallo y abstenerse. La lista de rangos especiales debe mantenerse; NAT/rutas particulares requieren además políticas de salida del entorno. El adaptador no sustituye controles de egress ni cuotas persistentes entre instancias.

## Evidencia y costo

El contexto exige fuente exacta autorizada, una oferta principal por fuente y antigüedad máxima de cinco minutos. Esa frescura corresponde a captura, no certificación del stock. Desconocidos siguen null; no hay total ni ranking. Transferencia, cuotas, impuestos, envío y originalidad necesitan revisión adicional.

Pruebas unitarias usan mocks y no gastan APIs. La adquisición real consume CPU/red del entorno, no inferencia ni suscripción de scraping. Una futura petición al modelo actual puede consumir tokens adicionales por la evidencia y requiere su presupuesto vigente. El helper no administra ni repone ese presupuesto.

```sh
node tests/shopper-offers.cjs
node tests/shopper-fetch.cjs
node tests/shopper-evidence-context.cjs
node tests/shopper-pipeline.cjs
```

Referencias: [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [Node HTTPS](https://nodejs.org/docs/latest-v24.x/api/https.html), [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/).


## Resultado de pruebas del adaptador

17 pruebas de política/transporte con mocks, 9 del contexto y 4 de composición; el extractor conserva 22 pruebas. Cubren variantes de IP privadas/reservadas, respuesta DNS mixta, pinning sin segunda resolución, redirecciones, tiempo total incluido DNS/cuerpo, bytes multibyte, compresión, contenido incompleto y presupuesto de intentos. Los mocks verifican decisiones y opciones TLS, no el handshake TLS real.

Una prueba anónima con una URL pública permitida devolvió DNS_ERROR; el diagnóstico del mismo resolver obtuvo ECONNREFUSED en consultas A y AAAA. No hubo respuesta HTTP ni se produjo evidencia para el modelo. No se cambiaron DNS, proxy, red ni pinning para forzar éxito. La conexión HTTP/TLS real del adaptador sigue pendiente. La adquisición anterior con otra herramienta no prueba que este adaptador funcione en ese entorno.

La computadora alternativa se encontraba offline; conexión intentada devolvió unavailable/offline. No se desplegó un servicio ni se duplicó infraestructura para sustituirla. La prueba debe repetirse en un entorno autorizado con resolución DNS disponible manteniendo idénticos controles.

El acceso existente al VPS tampoco ofrece un ejecutor de comandos: el conector permite diagnóstico acotado y la sesión cloud no tiene agente ni configuración SSH utilizable. No se copiaron credenciales, habilitaron permisos del nodo Code ni modificaron servicios. No se requiere encender una computadora para mantener documentado este límite.
