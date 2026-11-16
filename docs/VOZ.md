# Voz opcional

La demo no escucha ni habla. No solicita micrófono. Estos son puntos de partida, no dependencias instaladas ni una afirmación sobre el motor usado en proyectos privados.

- [Piper](https://github.com/OHF-Voice/piper1-gpl): síntesis local. Motor GPL-3.0-or-later; cada modelo de voz tiene condiciones propias. Medir memoria/latencia y revisar licencia de la voz antes de redistribuirla.
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp): transcripción local, licencia MIT. Requiere modelo descargado y recursos de cómputo. Ningún modelo está incluido.
- [ClippyJS](https://github.com/pithings/clippy): referencia de mascota y lectura con Web Speech. Su código MIT no concede derechos sobre personajes, nombres o recursos de Microsoft. No se distribuyen esos recursos.
- [edge-tts](https://github.com/rany2/edge-tts): alternativa en línea, biblioteca LGPLv3. Transmite texto a un servicio externo; no equivale a voz local ni a disponibilidad/precio garantizados.

Para una primera adaptación: botón Leer, botón Detener y texto siempre visible. Dictado solo mientras se pulsa y nunca envío automático. Informar si la voz del navegador o un proveedor puede usar red. Preferir mascota original y no presentar la voz como inteligencia del agente.
