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

La aplicación se trabajó con un asistente de IA basado en **Copilot SDK en VS Code**. **Claude, Gemini y Antigravity** también se solicitaron como herramientas a declarar, pero no se utilizaron en esta sesión. Incluye esas herramientas en la entrega solo si también las usaste por tu cuenta; registra sus prompts y resultados reales en la bitácora.

La bitácora de programación debe contener los prompts reales y las pruebas realizadas por quien entrega el proyecto; no se inventan prompts ni resultados.
