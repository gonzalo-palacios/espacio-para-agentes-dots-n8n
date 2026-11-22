# Brief maestro — NOD + n8n

Actualizado: **22 de noviembre de 2026** · Propietario: **Gonzalo Palacios**.

Este es el documento de referencia único de este proyecto local. Consolida documentación, versiones publicadas y trabajo pendiente encontrado en el GitHub de `gonzalo-palacios`. No se encontró un brief maestro preexistente específico de NOD: este documento se elaboró a partir de las fuentes enlazadas al final.

## 1. Identidad y propósito

**Decisión del propietario del 22/11/2026:** este es el proyecto oficial de **NOD + n8n**. La carpeta `C:\Users\gonza\OneDrive\Documentos\ChatGPT\NOD+N8N` es su espacio de trabajo oficial y `gonzalo-palacios/espacio-para-agentes-dots-n8n` es el repositorio canónico de GitHub. Continuar el desarrollo y mantener el único brief maestro aquí; no crear otro proyecto o repositorio sustituto salvo instrucción posterior del propietario. Esta designación expresa la titularidad del proyecto de Gonzalo, no una afiliación oficial con proveedores. No implica sincronización automática ni que los cambios locales ya estén publicados en GitHub.

El nombre de esta carpeta es **NOD+N8N**. El repositorio directamente relacionado se llama **Espacio para Agentes Dots+N8N**. Se conserva NOD como nombre local pedido por el propietario; las fuentes revisadas no definen NOD como sigla ni confirman un cambio de nombre de Dots a NOD.

La iniciativa busca ofrecer un espacio comprensible para organizar tareas y explorar la coordinación entre agentes, con n8n como posible motor de automatización. Su base actual es una plantilla educativa local, acompañada de utilidades funcionales, ejemplos deterministas y prototipos de integración.

La visión de largo plazo incluye mensajería privada y consentida entre Dots de distintos usuarios. Esa visión es una propuesta de investigación: no se ha demostrado en estas fuentes una red operativa entre cuentas ni un mecanismo compatible para activar Dots ajenos.

Repositorio principal: [espacio-para-agentes-dots-n8n](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n). Base consultada: rama `main`, commit `8483eaef155882edfb70775bd18b282c42470866`, versión de paquete `0.2.0-pre`.

## 2. Qué existe hoy

| Componente | Utilidad y estado documentado | Límite principal |
|---|---|---|
| Escritorio de agentes | Demo local con ocho ventanas y simulación del recorrido de una tarea | No crea agentes ni ejecuta workflows desde el navegador |
| Taller local | Convierte notas en tareas editables, permite marcar avances y exportar Markdown/JSON | Trabajo en memoria de la pestaña; se pierde al cerrar o recargar |
| Notas a lista para n8n | Transformación determinista, manual, con datos ficticios | Responsables y fechas quedan vacíos; no crea tareas externas |
| Enrutamiento simulado | Valida acciones, destino, identificador, confirmación y saltos | No envía nada; deduplicación solo dentro del lote |
| Mapa 3D del escritorio | Grafo sintético con rotación, zoom, búsqueda, vecinos, vista plana y lista textual | No está conectado a Obsidian ni representa agentes reales |
| Apariencia | Vista clásica o tipo celular, tres fondos CSS y formas de iconos | Solo guarda preferencias de apariencia, de forma explícita, en ese navegador |
| Puente local a n8n | Cliente HTTP experimental para dos tareas ficticias fijas | Probado contra un servidor de contrato; no validado en n8n real según `main` |
| Galaxia Aurora v2 | Demo independiente distribuida como ZIP de release | Informes ficticios; no conecta n8n ni agentes |
| Evidencia para Shopper | Prototipo en PR #3: extracción de ofertas y adquisición HTTPS acotada | No integrado a Shopper activo; no desplegado |
| Voz, Ollama y agentes autónomos | Ideas y guías para futuras adaptaciones | No incluidos ni activos |

La disponibilidad anterior se refiere al repositorio y sus publicaciones. En la segunda etapa se incorporó y probó el código de `main` en este equipo; el diagnóstico local actualizado está en la sección 11.

## 3. Experiencia y casos de uso

**Entrada principal sugerida: el taller local.** Una persona escribe `Comprar papel; Revisar presupuesto`, genera dos tareas, completa responsable/plazo, marca avances y exporta Markdown. No requiere cuenta, IA ni servicio externo.

El taller separa por punto y coma o salto de línea, elimina duplicados normalizando espacios y mayúsculas al crear la lista y conserva la primera variante. No interpreta fechas relativas ni ejecuta el contenido de las notas. La exportación permite llevar el resultado a otro sistema, pero no constituye una sincronización.

El escritorio sirve para aprender roles y recorridos. El catálogo de ejemplo contiene Coordinador, Investigación y Documentos; la interfaz de `main` todavía no lo carga automáticamente desde configuración.

El mapa del escritorio permite explorar relaciones ficticias. Galaxia Aurora es otra experiencia visual: nebulosa, estrella, planetas y lunas, cámara y movimiento de órbitas, con informes de ejemplo al seleccionar una luna. No debe confundirse el ZIP de Aurora con el módulo `desktop/map3d` de `main`.

## 4. Arquitectura consolidada

### Circuitos actuales

1. **Utilidades locales:** navegador → HTML/CSS/JavaScript → procesamiento en memoria → exportación manual.
2. **Ejemplos n8n:** inicio manual → datos ficticios → código determinista → salida visible en n8n. Están separados del escritorio.
3. **Puente experimental:** comando explícito → endpoint de prueba en loopback → respuesta acotada. No conecta el escritorio a un modelo.

Tecnología de la base: Node.js 22 o superior, sin dependencias npm; servidor estático en `127.0.0.1:8080`. El mapa proyecta posiciones 3D mediante Canvas 2D. El taller no persiste notas; la apariencia guarda únicamente opciones enumeradas bajo `dots-n8n-appearance-v1`.

Rutas útiles del repositorio remoto:

- `desktop/index.html`: escritorio.
- `desktop/tasks.html`: taller.
- `desktop/map3d/`: mapa sintético.
- `workflows/01-notas-a-lista.json` y `02-enrutamiento-simulado.json`: ejemplos manuales inactivos.
- `src/local-bridge.cjs` y `examples/local-bridge/workflow.json`: puente experimental.
- `config/agents.example.json`: catálogo documental.

Comandos disponibles en esta carpeta desde la incorporación del código: `npm start`, `npm test` y `npm run n8n:preview`.

### Arquitectura futura propuesta

Navegador → backend autenticado → validación y autorización del servidor → n8n → adaptador de agente/herramienta → auditoría → resultado.

Requiere identidad, permisos por acción/destino, claves en servidor, límites de entradas/salidas, herramientas permitidas, idempotencia persistente, saltos/reintentos acotados, presupuesto del servidor, cancelación y manejo de fallos. Un campo `confirmed: true` no autentica ni autoriza por sí mismo.

## 5. Versiones publicadas y ramas pendientes

### Releases disponibles

| Publicación | Contenido y forma de abrir | Verificación de esta revisión |
|---|---|---|
| [Taller local v0.1.0 preliminar](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/releases/tag/taller-v0.1.0-pre) | Asset `taller-local-v0.1.0-pre.zip`; extraer completo y abrir `taller-local/tasks.html` | Metadatos y notas consultados; ZIP no descargado ni probado aquí |
| [Galaxia Aurora v2 preliminar](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/releases/tag/galaxia-aurora-v2-pre) | Asset `galaxia-aurora-v2.zip`; extraer completo y abrir `index.html` | Metadatos y notas consultados; ZIP no descargado ni probado aquí |

Aurora se entrega en el asset ZIP, no en los archivos de código fuente que GitHub genera para la etiqueta. Las versiones `0.2.0-pre`, `taller-v0.1.0-pre` y `galaxia-aurora-v2-pre` identifican entregables diferentes.

### Pull requests abiertos, sin fusionar al momento de la consulta

| PR | Estado | Aporte | Pendiente o límite |
|---|---|---|---|
| [#2 — Fallos del puente](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/pull/2) | Borrador | Resultado incierto ante fallos de transporte/lectura; una tentativa, sin reintentos ni redirecciones | Pruebas HTTP locales; no n8n real |
| [#3 — Evidencia de compras](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/pull/3) | Borrador | Extractor JSON-LD, subflujo n8n, adaptador HTTPS y contexto de evidencia | Adquisición real del adaptador bloqueada por DNS; integración end-to-end pendiente |
| [#4 — Primer uso](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/pull/4) | Abierto, no borrador | Instrucciones centradas en taller, exportación y acceso a Aurora | Cambios documentales aún fuera de `main` |
| [#5 — Foco del mapa](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/pull/5) | Borrador | Centrado, vecinos, filtrado contextual, órbita/desplazamiento y controles accesibles | QA visual, móvil y lector de pantalla pendientes |

Los resultados de pruebas de estos PR son reportes de sus autores; no se volvieron a ejecutar al preparar este documento.

## 6. Shopper: alcance recuperado

El prototipo busca aportar evidencia al modelo existente, sin reemplazarlo ni añadir otra inferencia automáticamente. Extrae ofertas declaradas en JSON-LD y prepara hasta tres fuentes recientes autorizadas. Campos desconocidos permanecen desconocidos; `purchaseApproved` es falso y no hay total ni ranking automático.

Se documentan pruebas en n8n **2.48.4 aislado**, con ejecución manual, llamada de subworkflow mediante JSON inline y replay de tres capturas públicas. Esto no demuestra compatibilidad del puente de `main`, llamada por ID de base de datos ni despliegue en producción.

La descripción del PR #3, en el commit `52d37bcb105284c91f803994d25b7d8551e82e76`, reporta **80 casos offline**. Algunos documentos conservan recuentos parciales anteriores de 21/22 pruebas; para el total del PR se toma su descripción actual, sin presentar todos los recuentos como equivalentes.

El adaptador usa allowlist confiable, HTTPS, validación DNS/IP, pinning, TLS, límites de tamaño/tiempo y sin redirecciones. Su intento real falló antes de HTTP con `DNS_ERROR`; los mocks no prueban un handshake TLS real. El contenido web sigue siendo dato no confiable. No hay compras, conexión operativa a un agente ni ejecución de modelos en este prototipo.

## 7. Antecedentes relacionados en otros repositorios

### Mi Capital: antecedente concreto de n8n y Jarvis

El repositorio privado `mi-capital` documenta dos flujos independientes: mercado argentino y simulación histórica. Sus documentos registran conexión OAuth/MCP y ejecuciones manuales exitosas en octubre de 2026, además de JSON portables y un generador de workflows.

Esto aporta una referencia de integración agente → herramientas → workflows, pero no demuestra que NOD/Dots+N8N esté conectado. Tampoco se verificó durante esta revisión el estado vivo de esa instancia. Los documentos distinguen flujos n8n disponibles de un sitio todavía pendiente de publicación y del acceso efectivo del Dot aún por comprobar.

No se trasladan al brief endpoints privados, IDs operativos ni credenciales. El detalle sigue en sus fuentes privadas, enlazadas abajo. Sus resultados financieros no forman parte del alcance funcional de NOD.

### Herramientas y diseño

- `mi-skill`: referencias a modelos de Hugging Face y posible invocación futura mediante n8n; catálogo de herramientas para Jarvis. Son antecedentes, no componentes instalados de este proyecto.
- `rommel-biblioteca`: documentación de diseño Nuri/VPS con referencias al grafo Jarvis. La relación encontrada es contextual, no una integración demostrada con Dots+N8N.
- Los briefs de RecibosPro, AsistenciaLocal y Fondo Fijo pertenecen a otros productos. No se mezclan sus requisitos comerciales con este brief.

## 8. Prioridades para continuar

Esta secuencia consolida pendientes de las fuentes; no fija fechas ni autoriza despliegues:

1. **Validar la utilidad actual:** probar taller y escritorio en Windows/Edge/Chrome, móvil, teclado, zoom y almacenamiento bloqueado; revisar exportaciones y pérdida de estado al recargar.
2. **Cerrar la validación n8n de la base:** importar los dos ejemplos manuales en laboratorio, registrar versión y resultados. Validar el puente por separado.
3. **Revisar los PR abiertos:** conservar trazabilidad por rama, pruebas y estado; fusionar solo los que completen su revisión correspondiente.
4. **Consolidar la entrada al producto:** taller como primer resultado útil; documentar Aurora como demo separada; hacer explícitos los estados demo/experimental/probado.
5. **Evolucionar la integración:** configuración real del catálogo, backend autenticado, auditoría, presupuesto e idempotencia persistente antes de acciones externas.
6. **Investigar mensajería entre Dots:** verificar capacidades admitidas, identidad, consentimiento, revocación, expiración y límites; empezar con dos agentes simulados y datos sintéticos.

## 9. Gobierno, límites y criterios de cierre

El propietario conserva el control. Dots–Jarvis figura como asistencia para coordinar el proyecto comunitario; no es una organización independiente ni un producto oficial de OpenAI, Microsoft o n8n. El código propio se declara MIT y los componentes de terceros mantienen sus licencias.

La demo no incluye IA, voces ni agentes ya instalados. No hay promesa de servicio continuo, compatibilidad universal, fechas ni presupuesto. Una integración nueva debe identificar datos enviados, destino, permisos y costo.

Una función se considera integrada cuando está incorporada a la base correspondiente y tiene evidencia reproducible de funcionamiento en su entorno real. Un PR abierto, un mock aprobado o una publicación separada no satisfacen por sí solos ese criterio.

Para mantener **un solo brief**, actualizar este archivo al cambiar alcance, versión, pruebas o prioridades. Conservar los documentos remotos como fuentes técnicas, no crear briefs maestros paralelos por módulo.

## 10. Fuentes y alcance de la búsqueda

Se enumeraron **14 repositorios accesibles** de `gonzalo-palacios` y se revisaron sus árboles de archivos, sin truncamiento informado. Las búsquedas de contenido por NOD, Dots, n8n y brief maestro devolvieron cero resultados, incluso para contenido conocido; se sustituyeron por inspección directa de nombres y documentación de las ramas predeterminadas. En el repositorio principal también se revisaron las cinco ramas listadas, los cuatro PR abiertos, el issue de investigación y las dos releases mediante sus metadatos y documentación relevante.

La revisión documental cruzada incluyó README, briefs y guías de integración; no fue una auditoría de todo el código, de cada skill, de cada commit histórico ni del contenido binario de los releases. No cubre repositorios sin acceso, otros propietarios o información fuera de GitHub. Por ello, ausencia de coincidencias no se interpreta como prueba de ausencia absoluta.

**Fuentes principales (base fijada al commit consultado):**

- [README principal](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/README.md).
- [Arquitectura](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/ARQUITECTURA.md), [roadmap](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/ROADMAP.md) y [gobernanza](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/GOVERNANCE.md).
- [Taller](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/TALLER-LOCAL.md), [apariencia](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/APARIENCIA.md) y [mapa](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/MAPA-3D.md).
- [n8n](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/N8N.md), [puente experimental](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/PUENTE-LOCAL-EXPERIMENTAL.md) y [validación](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/8483eaef155882edfb70775bd18b282c42470866/docs/VALIDACION.md).
- [Convocatoria de mensajería entre Dots, issue #1](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues/1).
- [Evidencia de compras](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/52d37bcb105284c91f803994d25b7d8551e82e76/docs/COMPRAS-EVIDENCIA.md) e [integración Shopper](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/blob/52d37bcb105284c91f803994d25b7d8551e82e76/docs/INTEGRACION-SHOPPER.md).
- Mi Capital (privado): [Jarvis](https://github.com/gonzalo-palacios/mi-capital/blob/4c81df3a51e401ce412e8c6d05a6f7977ae756a5/docs/JARVIS.md), [estado de publicación](https://github.com/gonzalo-palacios/mi-capital/blob/4c81df3a51e401ce412e8c6d05a6f7977ae756a5/docs/ESTADO-PUBLICACION.md), [flujos n8n](https://github.com/gonzalo-palacios/mi-capital/blob/4c81df3a51e401ce412e8c6d05a6f7977ae756a5/integrations/n8n/README.md).
- Antecedentes: [catálogo de herramientas](https://github.com/gonzalo-palacios/mi-skill/blob/4f0fc535176ef134b9b586798d360001df0ceb23/catalogo-herramientas/README.md) y [diseño Nuri/VPS](https://github.com/gonzalo-palacios/rommel-biblioteca/blob/cd85c6738c6f4dbb650594892d7fbbba676fea84/design/nuri/VPS.md).

**Inventario examinado:** recibospro-hibridos, AsistenciaLocal, Proveedores, Martin, mi-skill, Inventario, bobinado-taller-cordoba, near-flow-local, nuri-design-system, mi-capital, Fondo-Fijo, ROMMEL-proyectos, rommel-biblioteca y espacio-para-agentes-dots-n8n.

**Resultado de la primera etapa:** un brief maestro local y un README de entrada. Las pruebas de las secciones anteriores son evidencia documental previa; la segunda etapa y sus pruebas locales se detallan a continuación. No se modificaron repositorios remotos, ramas ni PR.

## 11. Código incorporado y diagnóstico local — 22/11/2026

Se descargaron los **48 archivos de `main`** al proyecto, fijados al commit `8483eaef155882edfb70775bd18b282c42470866`. El README original se guardó en `docs/README_ORIGINAL.md` para conservar este punto de entrada y el brief. `docs/ORIGEN_CODIGO.json` registra rutas y hashes Git originales. No se fusionaron ramas pendientes ni se descargó el asset de Aurora.

### Entorno y pruebas realizadas

| Comprobación | Resultado local |
|---|---|
| Node.js / npm | 24.21.0 / 11.19.0; cumple Node >=22 |
| Dependencias de la demo | Ninguna; no requiere instalar paquetes |
| `npm test` | Suite completa aprobada: base de 44 comprobaciones, 13 aserciones del taller, rutas, mapa, integración, puente y apariencia |
| HTTP real del puente contra servidor de contrato | Aprobados límite de 16 KiB, bloqueo de redirección y timeout de 5 s; no es n8n real |
| HTTP real del servidor estático | `/`, `/tasks.html` y `/map3d/index.html`: 200; `/.env` y `/BRIEF_MAESTRO.md`: 404; POST `/`: 405 |
| `npm run n8n:preview` | Correcto, sin envío de solicitudes |
| n8n CLI instalado | Versión 2.14.2; no se validó importación ni ejecución real de los workflows |
| Puerto habitual de n8n | No se encontró listener en 5678 en la comprobación inicial; esto no descarta otra configuración/puerto |
| Docker | Cliente instalado; motor Docker Desktop Linux no disponible en la consulta |
| Navegador automatizado | Intentos HTTP rechazados o agotados; fallback de Chrome nativo bloqueado por ventana minimizada. Validación visual pendiente |

El servidor estático respondió en una ejecución de diagnóstico autocontenida y se detuvo al terminar. Los intentos de mantenerlo accesible entre llamadas de herramientas no lograron una sesión de navegador utilizable. **No se deja anunciado como servicio activo ni como inicio automático.** No se modificaron firewall, permisos de red ni configuración de Docker/n8n.

### Cómo usarlo ahora

1. Abrir `INICIAR.cmd` con doble clic. Inicia el servidor desde la carpeta correcta y mantiene una consola visible para detenerlo con Ctrl+C.
2. Abrir `http://127.0.0.1:8080`; taller en `/tasks.html`, mapa en `/map3d/index.html`.
3. Alternativa sin servidor: abrir los HTML de `desktop` directamente.
4. Exportar las tareas antes de cerrar o recargar: no se guardan automáticamente.

### Qué falta para considerar completa la instalación funcional

**Demo local:** no faltan dependencias de ejecución. Falta verificar interacción y aspecto en el navegador real del usuario: ventanas, creación/edición/marcado/exportación de tareas, apariencia, mapa, teclado y pantalla pequeña. Las pruebas con DOM simulado no sustituyen esa revisión.

**Ejemplos n8n:** usar un laboratorio aislado, importar los dos JSON de `workflows`, mantenerlos inactivos y ejecutar manualmente. Registrar compatibilidad con la versión instalada 2.14.2 y las salidas esperadas de `docs/N8N.md`. No se inspeccionó ni modificó la base de datos existente de n8n. Docker no es obligatorio si se usa el CLI ya instalado.

**Puente real:** configurar una instancia de laboratorio escuchando solo en loopback; importar `examples/local-bridge/workflow.json`, revisar los nodos y activar únicamente la escucha de prueba. Después ejecutar `node src/local-bridge.cjs --send-demo` y verificar las dos tareas ficticias. No se hizo ese envío aquí. Un fallo de transporte puede dejar el resultado incierto; revisar la ejecución antes de repetir (PR #2 sigue pendiente).

**Agentes operativos:** falta desarrollar la integración escritorio → backend autorizado → n8n → adaptadores. No se resuelve instalando dependencias: el código actual no implementa esa conexión. Tampoco incluye IA, voz ni mensajería entre Dots de distintas cuentas.

**Otros módulos:** Shopper y mejoras del mapa permanecen en PR; Aurora es un ZIP de release separado. Su incorporación requeriría una etapa propia de revisión y validación.
