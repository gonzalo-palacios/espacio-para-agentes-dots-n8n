# NOD + n8n

**Proyecto oficial del propietario, confirmado el 22/11/2026.** Esta carpeta es el espacio de trabajo oficial de NOD + n8n. Su repositorio canónico es [gonzalo-palacios/espacio-para-agentes-dots-n8n](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n). Mantener aquí la continuidad del proyecto y un único brief maestro, salvo indicación posterior del propietario.

La referencia única de este proyecto es [BRIEF_MAESTRO.md](BRIEF_MAESTRO.md). El código de la rama principal de Dots+n8n ya está incorporado.

Contiene propósito, componentes existentes, arquitectura, releases, propuestas pendientes, antecedentes de Jarvis/n8n, prioridades y fuentes de GitHub. Consolidado el 22 de noviembre de 2026.

## Abrir en Windows

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

El escritorio, taller y mapa están disponibles. La conexión real a n8n sigue pendiente; tener n8n instalado no conecta automáticamente la demo. El diagnóstico y los siguientes pasos están en la sección 11 del brief.

Origen: [Espacio para Agentes Dots+N8N](https://github.com/gonzalo-palacios/espacio-para-agentes-dots-n8n), commit `8483eaef155882edfb70775bd18b282c42470866`. Los 48 archivos importados están registrados en [ORIGEN_CODIGO.json](docs/ORIGEN_CODIGO.json). El README original se conserva en `docs/README_ORIGINAL.md`; sus enlaces relativos están escritos para la raíz del repositorio de origen.

Actualizar el brief existente para mantener una sola referencia. No se importaron las ramas de PR pendientes ni el ZIP separado de Galaxia Aurora.
