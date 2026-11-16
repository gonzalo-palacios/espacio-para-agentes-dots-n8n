# Espacio para Agentes Dots+N8N

Una primera contribución para quienes quieren **entender y organizar un equipo de agentes** sin empezar entregando credenciales. Escritorio educativo inspirado en interfaces clásicas, con dos ejemplos de n8n ejecutados manualmente y sin IA ni servicios pagos.

**v0.1.0-pre · versión preliminar comunitaria.** No es un producto de Microsoft, OpenAI ni n8n. No crea Dots, no los conecta por sí solo y no incluye agentes ya instalados.

## Probalo en un minuto

1. Descomprimí el paquete.
2. Abrí `desktop/index.html` con tu navegador.
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

**Importación en n8n real aún no verificada en esta versión.** Se comprobó sintaxis, estructura y ejecución del código con una simulación del contrato `$input.all()`. No prometemos compatibilidad universal.

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

44 comprobaciones sin descargar paquetes: lógica de notas, validación, saltos, duplicados del lote, estructura y seguridad de workflows, sintaxis y navegación con DOM simulado. Ver [docs/VALIDACION.md](docs/VALIDACION.md) para límites y pruebas manuales pendientes.

## Contribuir

Buscamos que una persona pueda descargarlo, entenderlo y aportar una mejora pequeña. Ver [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) y [ROADMAP.md](ROADMAP.md). No enviar datos privados, claves ni exports reales con credenciales.

## Licencias

Código propio: MIT, ver [LICENSE](LICENSE). Fondo reemplazado por gradientes CSS originales, sin recursos del escritorio privado. n8n y los proyectos enlazados tienen licencias independientes; no están incluidos ni relicenciados. Ver [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
