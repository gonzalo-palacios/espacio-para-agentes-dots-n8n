# Espacio para Agentes Dots+N8N

Proyecto comunitario gestionado con asistencia de **Dots–Jarvis**. [Gobernanza y límites](GOVERNANCE.md).

## Empezá por algo útil: una nota → una lista

**Prueba de unos 2 minutos en una computadora.** No necesitás cuenta de ChatGPT, Dots, n8n, Node.js ni claves API para esta ruta.

**[⬇ Descargar taller local (ZIP · versión preliminar)](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/releases/download/taller-v0.1.0-pre/taller-local-v0.1.0-pre.zip)**

1. Descargá el taller con el enlace anterior y descomprimí el ZIP completo; no abras el HTML dentro del archivo comprimido.
2. Abrí **`taller-local/tasks.html`** con tu navegador. Conservá los archivos vecinos `tasks-core.js` y `tasks-ui.js`. El ZIP incluye instrucciones y licencia.
3. Pegá este ejemplo ficticio y pulsá **Crear lista**:

   `Comprar papel; Revisar presupuesto`

4. Deberías ver **dos tareas**, con responsable y plazo vacíos. Completá esos campos si querés, marcá una tarea y pulsá **Descargar Markdown**. Abrí el archivo descargado: la tarea marcada debe aparecer con `[x]`.

**Resultado:** una lista que podés editar y llevar a tu editor de notas. No se ejecutan las tareas ni se contacta a nadie. El procesamiento es local y determinista, sin IA ni telemetría. **Al cerrar o recargar se pierde la lista: descargala antes.** Usá datos ficticios en esta primera prueba.

Si ves el código en vez de la página, abrí el archivo con un navegador. Si los botones no responden, comprobá que descomprimiste toda la carpeta; la [guía del taller](docs/TALLER-LOCAL.md) también ofrece un servidor local opcional. Verificado en navegador de escritorio cloud, sirviendo localmente el ZIP exacto descomprimido: se crearon las dos tareas, se marcó una y el Markdown descargado conservó exactamente `[x]` y `[ ]`. No se probó en Windows ni abriendo con `file://`; no prometemos compatibilidad universal.

### ¿Te sirvió? Contarlo es opcional

No registramos quién descarga ni usa el taller. Si querés ayudar, [contanos el resultado en un issue](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues/new?title=Primera%20prueba%20del%20taller), con tres datos: **qué esperabas, si lograste descargar la lista y dónde te trabaste**. Agregá navegador/sistema si hubo un error. Publicar un issue requiere cuenta de GitHub; usar el taller no.

Antes, revisá [issues existentes](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues). El comentario será público: no adjuntes notas reales, datos personales, claves ni archivos exportados con información privada. No hace falta enviar capturas ni demostrar una descarga.

## Después: explorá la demo de agentes

Una primera contribución para quienes quieren **entender y organizar un equipo de agentes** sin empezar entregando credenciales. Escritorio educativo inspirado en interfaces clásicas, con dos ejemplos de n8n ejecutados manualmente y sin IA ni servicios pagos.

**v0.2.0-pre · versión preliminar comunitaria.** No es un producto de Microsoft, OpenAI ni n8n. No crea Dots, no los conecta por sí solo y no incluye agentes ya instalados.

## Mapa 3D de ejemplo

Desde el escritorio, abrí **Explorar mapa 3D de ejemplo**. Rotá, acercá, buscá nodos y recorré sus relaciones. Incluye vista 2D y lista textual alternativa. Son datos ficticios, no una conexión a Obsidian ni a agentes reales. [Guía](docs/MAPA-3D.md).

## Recorrido simulado del escritorio (opcional)

1. Para el escritorio completo, usá **Code → Download ZIP** en este repositorio y descomprimilo. Es una descarga distinta del taller independiente.
2. Abrí `desktop/index.html` de esa carpeta con tu navegador.
3. Abrí **Conexiones → Simular recorrido**. No salen pedidos reales ni se usan APIs.

No hace falta instalar nada para esta demo. Para servirla localmente, con Node.js 22 o superior instalado:

```sh
npm start
```

Abrí `http://127.0.0.1:8080`. Cerrá con Ctrl+C. No hay dependencias npm ni hace falta `npm install`. El servidor solo entrega el escritorio y escucha en la propia computadora. No lo expongas a Internet.

## ¿Qué funciona y qué no?

| Parte | Estado |
|---|---|
| Ocho ventanas, navegación y recorrido de una tarea | Demo interactiva local |
| Notas a lista | Código funcional determinista; ejemplo JSON para n8n |
| Validación y enrutamiento | Simulación funcional, nunca envía nada |
| Conexiones reales, permisos, presupuesto, auditoría | Diseño ilustrativo; no controles operativos |
| Voz, Ollama y agentes autónomos | Adaptaciones futuras; enlaces y guía incluidos |
| Dots de ChatGPT | No incluidos ni creados por el paquete |

## Primera utilidad: notas a lista

`workflows/01-notas-a-lista.json` separa una nota por punto y coma o salto de línea. Mantiene cada fragmento literal y deja responsable y fecha en blanco: no adivina intenciones. Por ejemplo, `Comprar papel; Ana confirma presupuesto` genera dos filas para revisar. No crea tareas en servicios externos.

## Segunda utilidad: entender el enrutamiento seguro

`workflows/02-enrutamiento-simulado.json` muestra entradas permitidas/bloqueadas por acción, confirmación ficticia, destino, identificador y número de saltos. Incluye un pedido y una consulta de estado. La consulta no se delega. Los duplicados se detectan **solo dentro del mismo lote**: no es una garantía entre ejecuciones o reinicios.

Un campo `confirmed: true` **no autentica al usuario ni constituye autorización real**. Este ejemplo nunca debe usarse solo para proteger acciones externas.

## Probar en n8n

En una instancia propia de prueba, importá uno de los JSON desde **Import from File**. Revisá los tres nodos: inicio manual, datos ficticios y procesamiento. Ejecutalo manualmente y mirá la salida del último nodo. No requiere credenciales. Los flujos están inactivos y no tienen webhooks, horarios, nodos HTTP ni envío de mensajes. Consultá [docs/N8N.md](docs/N8N.md) y anotá la versión de n8n que pruebes.

**Importación en n8n real aún no verificada en este candidato.** Se comprobó sintaxis, estructura y ejecución del código con una simulación del contrato `$input.all()`. No prometemos compatibilidad universal.

## Personalizar sin riesgos

- Modificá los textos/roles en `desktop/index.html`.
- `config/agents.example.json` documenta un catálogo de ejemplo: la interfaz todavía no lo carga automáticamente.
- `.env.example` es referencia documental: la demo no carga variables ni secretos.
- Seguí [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) antes de conectar un backend.
- Voz: [docs/VOZ.md](docs/VOZ.md). Ningún motor, voz ni personaje Microsoft viene empaquetado.

## Pruebas

```sh
npm test
```

Suite base de 44 comprobaciones, más pruebas del taller local, rutas, mapa e integración, sin descargar paquetes: lógica de notas, validación, saltos, duplicados del lote, estructura y seguridad de workflows, sintaxis y navegación con DOM simulado. Ver [docs/VALIDACION.md](docs/VALIDACION.md) para límites y pruebas manuales pendientes.

## Convocatoria internacional / International call

Buscamos colaboradores para investigar una mensajería privada y consentida entre Dots de distintos usuarios. **Es una propuesta, no una integración entre cuentas ya disponible.** Participá con ideas, pruebas o traducciones en la [convocatoria multilingüe](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues/1), con resúmenes iniciales en 10 idiomas y comentarios bienvenidos en cualquier idioma.

We welcome contributors to research privacy-first, owner-authorized messaging between different users’ Dots. This is a proposal, not a working cross-account integration. Join the [multilingual call for collaborators](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues/1).


## Contribuir

Buscamos que una persona pueda descargarlo, entenderlo y aportar una mejora pequeña. Ver [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) y [ROADMAP.md](ROADMAP.md). No enviar datos privados, claves ni exports reales con credenciales.

## Licencias

Código propio: MIT, ver [LICENSE](LICENSE). Fondo reemplazado por gradientes CSS originales, sin recursos del escritorio privado. n8n y los proyectos enlazados tienen licencias independientes; no están incluidos ni relicenciados. Ver [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Experimento local opt-in (pendiente de revisión)

Cliente CLI de prueba a n8n con datos ficticios fijos; no afecta el escritorio ni los dos workflows manuales. Ver [guía y límites](docs/PUENTE-LOCAL-EXPERIMENTAL.md). No fue importado aún en n8n real.
