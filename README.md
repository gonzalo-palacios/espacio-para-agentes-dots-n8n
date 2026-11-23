# NOD + n8n

**Proyecto oficial del propietario, confirmado el 22/11/2026.** Esta carpeta es el espacio de trabajo oficial de NOD + n8n. Su repositorio canónico es [gonzalo-palacios/espacio-para-agentes-dots-n8n](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n). Mantener aquí la continuidad del proyecto y un único brief maestro, salvo indicación posterior del propietario.

La referencia única de este proyecto es [BRIEF_MAESTRO.md](BRIEF_MAESTRO.md). El código de la rama principal de Dots+n8n ya está incorporado.

Contiene propósito, componentes existentes, arquitectura, releases, propuestas pendientes, antecedentes de Jarvis/n8n, prioridades y fuentes de GitHub. Consolidado el 22 de noviembre de 2026.

## Probá una demo sin instalar nada

Estas dos descargas preliminares se abren en el navegador de una computadora. No necesitan n8n, Node.js, cuenta ni claves. Descomprimí el ZIP completo antes de abrir el HTML.

- **[Taller local (ZIP)](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/releases/download/taller-v0.1.0-pre/taller-local-v0.1.0-pre.zip)**. Abrí `taller-local/tasks.html`, pegá `Comprar papel; Revisar presupuesto` y pulsá **Crear lista**. Deben aparecer dos tareas. Podés marcar una, pulsar **Descargar Markdown** y comprobar que se exportó con `[x]`. Se probó en un navegador de escritorio sirviendo el ZIP extraído; no se verificó la apertura directa del archivo en Windows.
- **[Galaxia Aurora v2 (ZIP)](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/releases/download/galaxia-aurora-v2-pre/galaxia-aurora-v2.zip)**. Abrí `index.html` y seleccioná una luna para abrir su informe ficticio.

Si querés contar cómo te fue, podés indicar si abrió y qué navegador usaste en [Issues](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n/issues), sin adjuntar datos personales.

## Abrir en Windows

**Con n8n conectado:** abrí `INICIAR_CON_N8N.cmd`, esperá el mensaje «NOD conectado» y entrá a http://127.0.0.1:8080/connection.html. Pulsá **Enviar prueba a n8n**. Deben aparecer «Comprar papel» y «Revisar inventario», procesadas por n8n real. La primera preparación puede tardar varios minutos. Conservá la consola abierta; Ctrl+C detiene ambos servicios.

**Solo demo, sin n8n:**

Hacé doble clic en `INICIAR.cmd`, mantené esa ventana abierta y entrá a http://127.0.0.1:8080. Para detenerlo, presioná Ctrl+C en esa ventana.

También podés abrir directamente [el escritorio](desktop/index.html), [el taller](desktop/tasks.html) o [el mapa](desktop/map3d/index.html), sin servidor.

Desde una terminal en esta carpeta:

```powershell
npm start
```

No hace falta `npm install`: no hay dependencias npm. Requiere Node.js 22 o superior; este equipo tiene 24.21.0.

## Verificar

```powershell
npm test
npm run n8n:preview
```

La suite pasó en este Windows el 22/11/2026. El segundo comando solo muestra una vista previa; no envía solicitudes.

## Estado local

El escritorio, taller y mapa están disponibles. La conexión local a n8n **ya se comprobó con n8n 2.14.2**: importación, ejecución de los dos ejemplos y recorrido HTTP completo desde NOD. Usa una base separada en `private/n8n-local/`, excluida de Git, y puertos de loopback 5679/5680; NOD usa 8080. No toca la instancia habitual ni el VPS.

La pantalla de conexión envía únicamente dos tareas ficticias; no envía notas del taller, no conecta agentes ni usa IA. El diagnóstico actualizado está en la sección 12 del brief y en [la guía de conexión](docs/CONEXION-LOCAL.md).

```powershell
npm run start:connected
# Con los servicios detenidos, para repetir todas las pruebas en n8n real:
npm run n8n:test
```

Origen: [Espacio para Agentes Dots+N8N](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n), commit `8483eaef155882edfb70775bd18b282c42470866`. Los 48 archivos importados están registrados en [ORIGEN_CODIGO.json](docs/ORIGEN_CODIGO.json). El README original se conserva en `docs/README_ORIGINAL.md`; sus enlaces relativos están escritos para la raíz del repositorio de origen.

Actualizar el brief existente para mantener una sola referencia. No se importaron las ramas de PR pendientes ni el ZIP separado de Galaxia Aurora.
