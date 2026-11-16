# Taller local de tareas

Una utilidad operativa sin IA, cuenta, API ni servicio externo. No es una simulación: convierte texto en una lista editable y permite exportarla.

## Probar en un minuto

1. Ejecutá `npm start` y abrí `http://127.0.0.1:8080/tasks.html`. También podés abrir `desktop/tasks.html` directamente.
2. Pulsá **Cargar ejemplo ficticio** y **Crear lista**.
3. Editá una tarea, responsable o plazo. Marcá una tarea completada.
4. Descargá Markdown para un editor de notas como Obsidian, o JSON para reutilizarlo. No se conecta a tu bóveda ni lee sus archivos.

El separador es punto y coma o salto de línea. La deduplicación usa texto normalizado (espacios y mayúsculas) y solo se aplica al crear la lista. Conserva la primera variante. No interpreta lenguaje natural, fechas ni responsables: esos campos quedan vacíos para completar. No calcula plazos relativos.

## Privacidad y límites

- Todo vive en la memoria de la pestaña. No hay `localStorage`, cookies, telemetría ni llamadas de red desde esta utilidad.
- Al recargar o cerrar se pierde el trabajo. Descargá el resultado antes.
- Los archivos exportados contienen lo que escribiste y pueden ser privados. No los incluyas en un repositorio público sin revisarlos.
- El JSON incluye `schema_version`, procesador local determinista y lista de tareas; no envía nada a n8n. Importarlo en otro sistema requiere configuración propia.
- La app no ejecuta las tareas escritas ni interpreta instrucciones dentro de ellas.
- La lista puede revisarse sin servidor. El servidor opcional solo escucha localhost y sirve rutas explícitas.

## Verificación

Pruebas del núcleo: separación, vacíos, duplicados, máximo de entrada, campos sin inferencias, marcado, exportación y escape Markdown. Pruebas de rutas/privacidad y suite anterior aprobadas. Revisión visual real y pruebas completas de interacción en navegador pendientes. No afirmar que ya se validaron importación n8n o conexiones Dots.
