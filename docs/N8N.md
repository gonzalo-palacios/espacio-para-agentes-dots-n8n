# Flujos de ejemplo

Requisito: instancia de prueba de n8n que incluya Manual Trigger v1 y Code v2 JavaScript, modo Run Once for All Items. No se fija una versión de n8n como probada hasta completar la importación real.

1. Importá `workflows/01-notas-a-lista.json` desde archivo.
2. Confirmá que solo hay tres nodos y ninguna credencial.
3. Ejecutá manualmente. Resultado esperado: tres items; `responsible` y `deadline` son null.
4. Cambiá solo el texto ficticio en el nodo **Datos ficticios**. No pegues secretos ni datos personales.
5. Importá `02-enrutamiento-simulado.json`. La salida esperada contiene un resultado `simulated` y otro `blocked`, ambos con `external_action: false`.
6. Mantenelos inactivos. Podés borrar estos workflows de prueba mediante la recuperación normal del producto cuando termines.

Los JSON se generaron desde cero. No son exports de la cuenta del autor. No contienen IDs de instancias, credenciales, webhooks ni referencias a otros flujos. Los IDs manual/example/process son identificadores internos de los nodos de ejemplo.

Documentación oficial consultada el 16/11/2026:
- https://docs.n8n.io/workflows/export-import/
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/

No se instala ni distribuye n8n. Revisá sus términos antes de alojarlo o redistribuirlo.
