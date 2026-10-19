# Cielo — El tiempo, en claro

Una aplicación web responsive para consultar el clima actual y el pronóstico de siete días. La interfaz ajusta sus tonos según las condiciones meteorológicas y ofrece tema claro (sol) y oscuro (luna). También permite buscar ciudades, usar la ubicación del dispositivo y cambiar entre Celsius y Fahrenheit; la elección de tema se guarda en el navegador.

## Ejecutar

No requiere instalación, cuenta ni clave de API. Abre `index.html` en un navegador con conexión a internet.

Para evitar restricciones del navegador al abrir archivos locales, también puedes servir la carpeta con cualquier servidor estático. Por ejemplo, con Node.js:

```bash
npx serve .
```

Luego abre la dirección local que indique el servidor.

> La ubicación del dispositivo puede requerir HTTPS o `localhost` y permiso explícito del navegador. Si no está disponible, puedes buscar una ciudad por nombre.

## API y funcionamiento

- [Open-Meteo Forecast API](https://open-meteo.com/en/docs) proporciona condiciones actuales, datos por hora y pronóstico diario.
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) resuelve los nombres de ciudades.
- Ambas APIs se consultan directamente desde el navegador y no requieren clave para este uso.
- La interfaz muestra mensajes si la ciudad no se encuentra, la conexión falla, la respuesta está incompleta o el navegador no puede compartir la ubicación.

## Herramientas de IA

Según lo declarado por el autor, las herramientas utilizadas para el proyecto fueron el asistente basado en **Copilot SDK en VS Code**, **Claude** y **Antigravity**. El autor indicó que Claude propuso una solución sencilla sin proporcionar la API y que Antigravity proporcionó una API, pero no modificó el diseño. **Gemini no se declara**, porque no se confirmó su uso.

La [bitácora de IA](./BITACORA-IA.pdf) registra los prompts verificables de esta conversación y los resultados de las pruebas. La consigna pide al menos cinco prompts: este registro contiene dos y señala que faltan tres por agregar desde los historiales reales antes de entregar. No se inventan prompts ni resultados.
