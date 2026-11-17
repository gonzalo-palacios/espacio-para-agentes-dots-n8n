# Compras: subflujo de evidencia (PROTOTIPO offline)

Plantilla experimental para ayudar al modelo que ya uses: **no lo reemplaza**, no compra y no agrega otra inferencia. Extrae datos declarados por un vendedor en HTML JSON-LD Product/Offer. No confundir extracción con verificación de veracidad, precio final o compatibilidad.

## Estado comprobado

- 22 tests locales, sin red ni API paga, incluyendo ejecución aislada del código exacto de los nodos del JSON.
- Configuración de los cuatro nodos validada contra esquema n8n; esto no sustituye ejecución en servidor.
- Ejemplo completamente ficticio en dominio reservado example.org; NO es una oferta comercial.
- Tres fichas reales Rasasi contrastadas con HTML directo; ver resultados abajo. Ruta manual y llamada de subflujo JSON inline probadas con n8n2.48.4 aislado, sin modelo ni producción.
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

Admite Product directo, dentro de @graph o WebPage.mainEntity, con Offer inline; excluye por defecto ofertas con Offer.url o Product.url/@id de otra ficha (productos relacionados). Normaliza www y slash final solo para comparar etiquetas, nunca para acceso de red. No garantiza identidad entre variantes que usan query string; esa revisión sigue pendiente. Solo admite este subconjunto; no resuelve @id, contextos remotos, AggregateOffer, variantes ProductGroup, HTML visible ni datos renderizados por JavaScript. Un campo ausente no se transforma en cero. Separadores locales ambiguos no se adivinan. Las etiquetas script se usan como contenedor de JSON y nunca se ejecutan. JSON-LD puede estar desactualizado o discrepar de lo visible.

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


## Validación pública de adquisición y extracción (17-11-2026 UTC)

Se hicieron GET HTTPS anónimos de URLs concretas, sin cookies, sin seguir redirecciones, con tiempo y tamaño máximos. Luego se ejecutó el extractor local sobre las respuestas completas, y se contrastó con texto HTML sin scripts y lectura de la ficha. No se hizo compra ni inferencia. Los precios son evidencia de una captura, no garantía de vigencia, autenticidad, entrega ni recomendación comercial.

### Rasasi: tres fichas reales

- [Perfumarte: Hawas Black 100 ml](https://www.perfumarte.ar/productos/hawas-black-rasasi-100ml-1nm6w/). Captura directa aproximadamente 22:20 UTC: JSON-LD ARS137500, InStock, coincide con texto de producto. Texto también ofrece ARS110000 por efectivo/transferencia, no extraído automáticamente. La lectura indexada mostró ARS123750/99000 de una promoción anterior: discrepancia entre capturas registrada, no usada como menor precio. Envío específico y costo final no calculados.
- [JFperfumes: Hawas Kobra 100 ml](https://jfperfumesaltagracia.mitiendanube.com/productos/rasasi-hawas-kobra-100ml-meriq/). JSON-LD ARS78632.50 y OutOfStock, coinciden con texto. Transferencia ARS70769.25 visible; no equivale a precio en cuotas. Se excluye de opciones disponibles. Costo de envío no calculado.
- [Catálogo Mayorista Perfumería Córdoba: Hawas for Him 100 ml](https://perfumeriacordobamayorist.mitiendanube.com/productos/rasasi-hawas-for-him-edp-100ml/). Captura aproximadamente 22:22 UTC: USD29 e InStock, texto con mismo precio y aviso de última unidad. No convertir a ARS sin tipo de cambio/condición del vendedor. Su banner de envío gratis expresa un umbral USD250000 inconsistente con la oferta: no se acepta como envío gratis. Condiciones mayoristas, costo final y entrega concreta pendientes.

No se ordenan por precio: son variantes distintas, monedas distintas y una no tiene stock. No se certifica originalidad del producto ni del vendedor.

### Defecto encontrado y corregido mediante prueba real

El primer prototipo omitía WebPage.mainEntity y devolvía productos relacionados en Tiendanube. La prueba real detectó esa falsa cobertura; ahora se recupera el producto principal y se excluyen URLs de otras fichas. Cuatro regresiones sintéticas adicionales elevan la suite a 21. También se verifica Product.url/@id; sin URL de identidad no se inventa una URL de oferta y se marca identidad desconocida. Los tres archivos HTML completos se usaron localmente para comprobar el fix, no se publican ni se incluyen datos de sesión. El filtro no resuelve todos los casos de variantes, canonical/URLs relativas ni JavaScript.

### Cobertura adicional y bloqueos

- Adafruit Raspberry Pi5 8GB: captura JSON-LD USD200/InStock consistente con texto visible; sin validación de envío ni compra.
- StarTech USB31000S: JSON-LD USD35.86/InStock, pero precio/stock no presentes en texto HTML visible capturado; quedan sin corroborar.
- CyberPower CP900EPFCLCD: no ofertas compatibles; no se inventó precio. La página sirve como ficha técnica, no oferta de venta.
- GMKtec y Portobello: descarga excede 1000000 bytes; se detuvo y no se analizó contenido parcial ni se elevó el límite.
- Suits: respuesta upstream connection failure; descartada, sin evasión ni reintentos automáticos.
- EssenZ: lector público sin líneas; Fylax ruta probada devuelve404. No se atribuyen precios actuales a esas fuentes.

Se instaló n8n2.48.4 desde npm en un entorno de laboratorio separado, sin credenciales heredadas ni servidor público. Se comprobó importación; ruta manual en copia sin el segundo trigger; y padre→Execute Workflow (fuente Parameter/JSON inline)→Entrada subflujo→Code. La ruta por ID de workflow publicado en base de datos NO quedó probada: el nuevo CLI difiere la activación hasta iniciar un servicio, que no se levantó. El JSON público sigue inactivo y la plantilla sigue en borrador, no desplegada en producción. La ejecución CLI directa del JSON con dos triggers toma entrada de subflujo sin datos y falla validación de html; usar fixture manual o llamador con entrada explícita.


### Compatibilidad del runner n8n

La prueba real detectó que el Code runner no expone la global JavaScript URL, aunque el harness inicial sí la inyectaba. Se reemplazó por una gramática de etiquetas HTTPS/DNS restringida, sin require ni nuevas autorizaciones. El test VM ya no inyecta URL. No es un parser URL universal: rechaza, entre otros, IPs, nombres IDN sin punycode, credenciales, protocolos distintos y espacios/backslashes. Sigue sin ser protección SSRF.

Tiempos medidos laboratorio: importación inicial6.917s; ejecución manual corregida4.446s de CLI; padre inline4.681s de CLI (1.357s de ejecución reportada). No son tiempos de búsqueda comercial ni de inferencia.


### Replay real n8n y segunda búsqueda

n8n2.48.4 aislado ejecutó también las tres capturas originales mediante padre→subflujo JSON inline:5.081s de CLI,1.836s de ejecución. Resultado: una oferta objetivo por tienda, precios/stock anteriores correctos,2/8/6 relacionados excluidos; purchaseApproved=false,modelInvoked=false,total/ranking=null. Al cerrar: cero workflows activos, cero procesos Node del laboratorio y ningún listener del broker. No se desplegó en VPS ni se ejecutó un agente con modelo.

Después se repitió la misma consulta pública y se descargaron de nuevo las mismas tres fichas aproximadamente22:33 UTC. Sin cambios en producto, URL, precio base, moneda ni stock declarado. Descuentos por transferencia también siguen110000ARS y70769.25ARS en las dos fichas correspondientes; se cotejaron como condiciones separadas, no como precio de cuotas. Envío y autenticidad continúan pendientes.

Tiempos medidos segunda ronda: búsqueda3.219s; adquisición/extracción/cotejo textual20.387s, de los cuales7.876s corresponden a tres descargas y16.697ms al extractor. No hay cronómetro global fiable para la primera ronda: no se afirma mejora de velocidad. Estos tiempos excluyen instalación, pruebas n8n, publicación y preparación del informe.

Comparación controlada sobre los mismos HTML: la versión inicial devolvía16 relacionados y omitía los3 productos objetivo; corregida devuelve los3 objetivos y excluye16 relacionados. Esto mide el defecto del extractor inicial, no errores de la primera lista final revisada, ni calidad de un modelo. La plantilla no proporciona scraping universal, no comprueba inventario en checkout y sigue requiriendo revisión humana.
