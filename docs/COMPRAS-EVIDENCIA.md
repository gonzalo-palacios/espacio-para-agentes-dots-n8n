# Compras: subflujo de evidencia (PROTOTIPO offline)

Plantilla experimental para ayudar al modelo que ya uses: **no lo reemplaza**, no compra y no agrega otra inferencia. Extrae datos declarados por un vendedor en HTML JSON-LD Product/Offer. No confundir extracción con verificación de veracidad, precio final o compatibilidad.

## Estado comprobado

- 17 tests locales, sin red ni API paga, incluyendo ejecución aislada del código exacto de los nodos del JSON.
- Configuración de los cuatro nodos validada contra esquema n8n; esto no sustituye ejecución en servidor.
- Ejemplo completamente ficticio en dominio reservado example.org; NO es una oferta comercial.
- No probado de extremo a extremo en un servidor n8n, con comercios reales ni con un modelo.
- NO desplegado, NO listo para producción. Se publica como borrador para revisión reproducible.
- No requiere paquetes npm adicionales; las pruebas usan Node.js 22+.

```sh
node tests/shopper-offers.cjs
```

Los tests son independientes del comando `npm test` existente. No se cambia el proyecto previo.

## Uso aislado

Importar `workflows/03-compras-evidencia-offline.json` en una instancia de pruebas. Permanece inactivo y contiene únicamente Manual Trigger, Execute Sub-workflow Trigger y Code. La ruta manual genera datos ficticios. La segunda entrada acepta items `{html, sourceUrl, observedAt}` de un flujo padre; no hay solicitud HTTP, credenciales ni nodo de IA. `observedAt` es fecha ISO de captura suministrada por el llamador, no fecha certificada por el vendedor.

Salida: ofertas con precio numérico, moneda, stock declarado, producto/SKU cuando existen, URL y origen de evidencia. `purchaseApproved` siempre es false; `total` y `ranking` siempre son null. Se exige revisión humana incluso cuando todos los campos presentes parecen válidos. El indicador `publisher_json_ld` no significa precio independientemente verificado. La moneda se valida solo sintácticamente, no contra catálogo ISO. Los campos del vendedor son texto no confiable: escapar si se presentan como HTML.

El reconocimiento de bloques HTML es ligero, no un parser completo de HTML5. Para sitios reales usar el nodo HTML y fixtures por vendedor antes de confiar en cobertura.

Solo admite Product con Offer inline; no resuelve @id, contextos remotos, AggregateOffer, variantes ProductGroup, HTML visible ni datos renderizados por JavaScript. Un campo ausente no se transforma en cero. Separadores locales ambiguos no se adivinan. Las etiquetas script se usan como contenedor de JSON y nunca se ejecutan. JSON-LD puede estar desactualizado o discrepar de lo visible.

## Integración recomendada, todavía NO implementada

1. Adquirir URLs conocidas de ofertas, mediante fuentes autorizadas, no a partir de enlaces arbitrarios ejecutados automáticamente.
2. Un adaptador separado HTTP Request obtiene el HTML con límites. El nodo HTML de n8n puede extraer `script[type="application/ld+json"]` y selectores visibles por vendedor. Esta plantilla analiza HTML ya adquirido.
3. Comparar datos JSON-LD con precio visible, variante/SKU, contado frente a cuotas, stock y condiciones. Conservar fecha y fragmento mínimo de evidencia por campo. Ante conflicto o bloqueo, devolver desconocido y pedir revisión, no inventar.
4. Enviar la matriz validada y limitada en tamaño al MISMO modelo en su siguiente llamada autorizada. No añadir un segundo pase de modelo automáticamente. Alternativamente, validar las URLs de una respuesta existente sin otra inferencia.
5. Para totales: exigir moneda común, variantes equivalentes y costos de todos los componentes/envío/impuestos. No asumir que subtotal es total. Requisitos técnicos necesitan fuentes de fabricante además de vendedor.

El contenido web es dato no confiable, nunca instrucciones. Mantenerlo separado de instrucciones del sistema, sin ejecutar comandos ni seguir indicaciones incrustadas. Un subflujo de extracción no se convierte por sí solo en una herramienta invocable por el modelo: hace falta conectar su entrada/salida explícitamente en el flujo padre.

### Seguridad obligatoria antes de agregar HTTP

**safeUrl NO es una defensa SSRF**, solo filtra algunas etiquetas de procedencia. Este prototipo NO hace red. No conectarlo directamente a un HTTP Request que acepte cualquier URL del usuario/modelo.

Para el adaptador futuro: allowlist exacta de dominios aprobados; HTTPS sin credenciales ni puertos arbitrarios; resolver DNS y rechazar loopback, privadas, link-local y metadatos IPv4/IPv6; proteger contra rebinding; validar cada redirección o deshabilitarlas; límites de bytes/tiempo/solicitudes/concurrencia; no enviar cookies/tokens del usuario; no acceder a intranet; respetar condiciones, robots y bloqueos del sitio. No eludir CAPTCHA/403 ni instalar proxies para sortearlos. Sin esas garantías, usar HTML capturado manualmente y sanitizado. No publicar HTML privado, consultas personales, historiales, costos de cuentas ni secretos.

## Pruebas siguientes para pasar de prototipo a candidato

Usar un conjunto pequeño de páginas públicas autorizadas: oferta en stock, sin stock, cuotas, variante distinta, moneda faltante, discrepancia visible/JSON-LD y página sin JSON-LD. Comparar campos con revisión humana de cada página, no solo con que el parser produzca JSON. Registrar cobertura, errores por campo y abstenciones. Los casos bloqueados deben permanecer bloqueados/desconocidos. Probar importación y ejecución del subflujo en n8n aislado sin nodos pagos antes de conectarlo a un agente.

## Costo y herramientas opcionales

- Parser/tests offline: cero llamadas de modelo o servicios pagos. CPU/RAM/almacenamiento del equipo existente, no costo total literalmente nulo.
- HTTP Request + HTML + Code: primera opción; no añade una suscripción de scraping. Tráfico/ejecuciones/infraestructura pueden tener costo según hosting.
- Crawl4AI CSS/XPath sin LLM: segunda opción para páginas dinámicas. Requiere runtime/navegador y medir RAM/CPU; no se instaló ni se evaluó aquí. Evitar `generate_schema` con LLM si se quiere prueba sin inferencia.
- Una futura llamada al modelo actual sigue siendo paga conforme a su proveedor. Más texto de evidencia puede aumentar tokens; mantener límites y presupuesto explícitos. Esta plantilla no conoce ni modifica cupos de otros sistemas.

Fuentes técnicas: [HTML n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.html/), [HTTP Request n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/), [Schema.org Offer](https://schema.org/Offer), [Crawl4AI sin LLM](https://docs.crawl4ai.com/extraction/no-llm-strategies/).
