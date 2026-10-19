const API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const DEFAULT_PLACE = {
  name: "Ciudad de México",
  admin1: "Ciudad de México",
  country: "México",
  latitude: 19.4326,
  longitude: -99.1332,
  timezone: "America/Mexico_City",
};

const state = {
  place: DEFAULT_PLACE,
  weather: null,
  unit: "c",
  theme: readSavedTheme(),
  requestId: 0,
};

const elements = {
  shell: document.querySelector("#app-shell"),
  location: document.querySelector("#location"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition"),
  updated: document.querySelector("#updated"),
  todayHigh: document.querySelector("#today-high"),
  todayLow: document.querySelector("#today-low"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"),
  humidityNote: document.querySelector("#humidity-note"),
  wind: document.querySelector("#wind"),
  uvIndex: document.querySelector("#uv-index"),
  uvNote: document.querySelector("#uv-note"),
  hourlyList: document.querySelector("#hourly-list"),
  dailyList: document.querySelector("#daily-list"),
  currentDate: document.querySelector("#current-date"),
  coordinates: document.querySelector("#coordinates"),
  sceneCaption: document.querySelector("#scene-caption"),
  status: document.querySelector("#status-message"),
  searchForm: document.querySelector("#search-form"),
  citySearch: document.querySelector("#city-search"),
  locateButton: document.querySelector("#locate-button"),
  unitToggle: document.querySelector("#unit-toggle"),
  themeToggle: document.querySelector("#theme-toggle"),
};

function readSavedTheme() {
  try {
    return localStorage.getItem("cielo-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme) {
  state.theme = theme;
  elements.shell.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
  elements.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  const nextTheme = theme === "dark" ? "claro" : "oscuro";
  elements.themeToggle.setAttribute("aria-label", `Cambiar a tema ${nextTheme}`);
  elements.themeToggle.title = `Cambiar a tema ${nextTheme}`;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#172326" : "#f5f5ef";
}

const weatherDescriptions = [
  [[0], "Despejado", "Cielo limpio"],
  [[1], "Mayormente despejado", "Luz entre nubes"],
  [[2], "Parcialmente nublado", "Nubes y claros"],
  [[3], "Nublado", "Cielo cubierto"],
  [[45, 48], "Con niebla", "Bruma en el aire"],
  [[51, 53, 55, 56, 57], "Llovizna", "Lluvia ligera"],
  [[61, 63, 65, 66, 67], "Lluvia", "Lluvia en camino"],
  [[71, 73, 75, 77], "Nieve", "Copos en el aire"],
  [[80, 81, 82], "Chubascos", "Aguaceros por momentos"],
  [[85, 86], "Chubascos de nieve", "Copos intermitentes"],
  [[95, 96, 99], "Tormenta", "Actividad eléctrica"],
];

function getWeatherDescription(code) {
  return weatherDescriptions.find(([codes]) => codes.includes(code))?.slice(1) ?? ["Tiempo variable", "Cielo cambiante"];
}

function weatherTheme(code, isDay) {
  if (!isDay) return "night";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  return "clear";
}

function formatTemperature(value) {
  const converted = state.unit === "f" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°`;
}

function formatWind(value) {
  if (state.unit === "f") return `${Math.round(value / 1.609)} mph`;
  return `${Math.round(value)} km/h`;
}

function formatTime(isoTime) {
  const match = isoTime.match(/T(\d{2}):(\d{2})/);
  if (!match) return isoTime;
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2]))));
}

function formatDay(isoDate, index) {
  if (index === 0) return "Hoy";
  if (index === 1) return "Mañana";
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`)).replace(".", "");
}

function createWeatherIcon(code, isDay = true) {
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const cloudyCodes = [1, 2, 3, 45, 48];

  if (rainCodes.includes(code)) {
    return `<svg class="weather-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M10 21.5a7 7 0 0 1-.5-14A9 9 0 0 1 26 10a5.8 5.8 0 0 1 0 11.5H10Z" fill="#D9E2DF" stroke="#91AAA8" stroke-width="1.2"/>
      <path d="m13 25-1.2 3M19 25l-1.2 3M25 25l-1.2 3" stroke="#6899A8" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  if (snowCodes.includes(code)) {
    return `<svg class="weather-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M10 21.5a7 7 0 0 1-.5-14A9 9 0 0 1 26 10a5.8 5.8 0 0 1 0 11.5H10Z" fill="#E3E9E9" stroke="#AABCC0" stroke-width="1.2"/>
      <path d="M13 25v5m-2-3 4 1m0-2-4 3m10-4v5m-2-3 4 1m0-2-4 3" stroke="#83A7B4" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  }
  if (code === 0 || (!cloudyCodes.includes(code) && !rainCodes.includes(code) && !snowCodes.includes(code))) {
    return `<svg class="weather-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      ${!isDay ? '<path d="M25.5 7a10.5 10.5 0 1 0 4.2 18.8A11 11 0 0 1 25.5 7Z" fill="#A8A8C0"/><circle cx="27.5" cy="10" r="1" fill="#E5C981"/><circle cx="31" cy="15" r=".8" fill="#E5C981"/>' : '<circle cx="18" cy="17" r="6" fill="#EDC66E"/><path d="M18 4v3m0 20v3M5 17h3m20 0h3M8.8 7.8l2.1 2.1m14.2 14.2 2.1 2.1m0-18.4-2.1 2.1M10.9 24.1l-2.1 2.1" stroke="#D6A95D" stroke-width="1.5" stroke-linecap="round"/>'}
    </svg>`;
  }
  return `<svg class="weather-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="13" cy="12" r="6" fill="#EBC66D"/>
    <path d="M11 26a6.5 6.5 0 0 1-.4-13A8.3 8.3 0 0 1 25.8 16a5.1 5.1 0 0 1 0 10H11Z" fill="#F5F3E9" stroke="#C6D1C9" stroke-width="1.1"/>
  </svg>`;
}

function setLoading(isLoading, message = "") {
  elements.status.textContent = message;
  elements.searchForm.querySelector("button").disabled = isLoading;
  elements.locateButton.disabled = isLoading;
  elements.searchForm.querySelector("button").textContent = isLoading ? "Buscando…" : "Buscar";
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`El servicio respondió con un error (${response.status}).`);
  }
  return response.json();
}

async function fetchWeather(place, signal) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "7",
  });
  return fetchJson(`${API_BASE}?${params}`, signal);
}

async function loadWeather(place, { announce = true } = {}) {
  const requestId = ++state.requestId;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  state.controller?.abort();
  state.controller = controller;

  if (announce) setLoading(true);
  try {
    const weather = await fetchWeather(place, controller.signal);
    if (requestId !== state.requestId) return;
    if (!weather.current || !weather.daily || !weather.hourly) {
      throw new Error("La respuesta del clima está incompleta. Intenta de nuevo.");
    }
    state.place = place;
    state.weather = weather;
    renderWeather();
    setLoading(false);
  } catch (error) {
    if (requestId !== state.requestId) return;
    if (error.name === "AbortError") {
      setLoading(false, "La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.");
    } else if (!navigator.onLine) {
      setLoading(false, "No hay conexión a internet. Revisa tu red e inténtalo de nuevo.");
    } else {
      setLoading(false, error.message || "No se pudo obtener el clima. Inténtalo de nuevo.");
    }
  } finally {
    window.clearTimeout(timeout);
  }
}

async function searchCity(name) {
  const params = new URLSearchParams({
    name,
    count: "1",
    language: "es",
    format: "json",
  });
  const data = await fetchJson(`${GEOCODING_BASE}?${params}`, state.controller?.signal);
  return data.results?.[0] ?? null;
}

function placeLabel(place) {
  return [place.name, place.admin1 && place.admin1 !== place.name ? place.admin1 : "", place.country]
    .filter(Boolean)
    .join(", ");
}

function renderWeather() {
  const { current, daily, hourly } = state.weather;
  const currentCode = current.weather_code;
  const [description, caption] = getWeatherDescription(currentCode);
  const theme = weatherTheme(currentCode, current.is_day === 1);

  elements.shell.dataset.weather = theme;
  elements.location.textContent = placeLabel(state.place);
  elements.temperature.textContent = Math.round(current.temperature_2m);
  elements.condition.textContent = description;
  elements.updated.textContent = `Actualizado ${formatTime(current.time)}`;
  elements.todayHigh.textContent = `Máx. ${formatTemperature(daily.temperature_2m_max[0])}`;
  elements.todayLow.textContent = `Mín. ${formatTemperature(daily.temperature_2m_min[0])}`;
  elements.feelsLike.textContent = formatTemperature(current.apparent_temperature);
  elements.humidity.innerHTML = `${Math.round(current.relative_humidity_2m)}<small>%</small>`;
  elements.humidityNote.textContent = current.relative_humidity_2m > 70 ? "Aire bastante húmedo" : "Humedad relativa";
  elements.uvIndex.textContent = daily.uv_index_max[0] == null ? "—" : Math.round(daily.uv_index_max[0]);
  elements.uvNote.textContent = uvDescription(daily.uv_index_max[0]);
  elements.currentDate.textContent = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${current.time.slice(0, 10)}T12:00:00Z`));
  elements.coordinates.textContent = `${Math.abs(state.place.latitude).toFixed(2)}° ${state.place.latitude >= 0 ? "N" : "S"}   ${Math.abs(state.place.longitude).toFixed(2)}° ${state.place.longitude >= 0 ? "E" : "O"}`;
  elements.sceneCaption.textContent = caption;
  renderHourly(hourly, current.time, current.is_day === 1);
  renderDaily(daily);
  renderUnits();
}

function uvDescription(value) {
  if (value == null) return "Sin dato disponible";
  if (value < 3) return "Bajo · protección mínima";
  if (value < 6) return "Moderado · busca sombra";
  if (value < 8) return "Alto · usa protección";
  return "Muy alto · evita el sol directo";
}

function renderHourly(hourly, currentTime, isDay) {
  const startIndex = Math.max(0, hourly.time.findIndex((time) => time >= currentTime));
  elements.hourlyList.replaceChildren();
  for (let offset = 0; offset < 8; offset += 1) {
    const index = startIndex + offset;
    if (index >= hourly.time.length) break;
    const item = document.createElement("div");
    item.className = "hour-item";
    const time = document.createElement("span");
    time.className = "hour-time";
    time.textContent = offset === 0 ? "Ahora" : formatTime(hourly.time[index]);
    const icon = document.createElement("span");
    icon.innerHTML = createWeatherIcon(hourly.weather_code[index], isDay || offset > 0);
    const temp = document.createElement("span");
    temp.className = "hour-temp";
    temp.textContent = formatTemperature(hourly.temperature_2m[index]);
    const rain = document.createElement("span");
    rain.className = "hour-rain";
    rain.textContent = `${Math.round(hourly.precipitation_probability[index] ?? 0)}% lluvia`;
    item.append(time, icon.firstElementChild, temp, rain);
    elements.hourlyList.append(item);
  }
}

function renderDaily(daily) {
  elements.dailyList.replaceChildren();
  const allHighs = daily.temperature_2m_max;
  const allLows = daily.temperature_2m_min;
  const range = Math.max(...allHighs) - Math.min(...allLows) || 1;
  const lowest = Math.min(...allLows);

  daily.time.forEach((date, index) => {
    const row = document.createElement("div");
    row.className = "day-row";
    const day = document.createElement("span");
    day.className = "day-name";
    day.textContent = formatDay(date, index);
    const icon = document.createElement("span");
    icon.innerHTML = createWeatherIcon(daily.weather_code[index]);
    const track = document.createElement("span");
    track.className = "temp-track";
    const bar = document.createElement("span");
    bar.className = "temp-range";
    const left = ((allLows[index] - lowest) / range) * 100;
    const width = Math.max(12, ((allHighs[index] - allLows[index]) / range) * 100);
    bar.style.left = `${left}%`;
    bar.style.width = `${Math.min(width, 100 - left)}%`;
    track.append(bar);
    const high = document.createElement("span");
    high.className = "day-high";
    high.textContent = formatTemperature(allHighs[index]);
    const low = document.createElement("span");
    low.className = "day-low";
    low.textContent = formatTemperature(allLows[index]);
    row.append(day, icon.firstElementChild, track, high, low);
    elements.dailyList.append(row);
  });
}

function renderUnits() {
  if (!state.weather) return;
  const { current, daily } = state.weather;
  elements.temperature.textContent = Math.round(state.unit === "f" ? (current.temperature_2m * 9) / 5 + 32 : current.temperature_2m);
  elements.feelsLike.textContent = formatTemperature(current.apparent_temperature);
  elements.todayHigh.textContent = `Máx. ${formatTemperature(daily.temperature_2m_max[0])}`;
  elements.todayLow.textContent = `Mín. ${formatTemperature(daily.temperature_2m_min[0])}`;
  elements.wind.innerHTML = `<span>${formatWind(current.wind_speed_10m)}</span>`;
  elements.unitToggle.querySelector('[data-unit="c"]').classList.toggle("unit-active", state.unit === "c");
  elements.unitToggle.querySelector('[data-unit="f"]').classList.toggle("unit-active", state.unit === "f");
  elements.unitToggle.setAttribute("aria-label", `Cambiar a ${state.unit === "c" ? "Fahrenheit" : "Celsius"}`);
  renderHourly(state.weather.hourly, current.time, current.is_day === 1);
  renderDaily(daily);
}

elements.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = elements.citySearch.value.trim();
  if (query.length < 2) {
    setLoading(false, "Escribe al menos dos letras para buscar una ciudad.");
    elements.citySearch.focus();
    return;
  }
  setLoading(true);
  const requestId = ++state.requestId;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  state.controller?.abort();
  state.controller = controller;
  try {
    const place = await searchCity(query);
    if (requestId !== state.requestId) return;
    if (!place) {
      setLoading(false, `No encontramos “${query}”. Prueba otra ciudad.`);
      return;
    }
    elements.citySearch.value = "";
    await loadWeather(place, { announce: false });
  } catch (error) {
    if (requestId !== state.requestId) return;
    const message = error.name === "AbortError"
      ? "La búsqueda tardó demasiado. Inténtalo de nuevo."
      : !navigator.onLine
        ? "No hay conexión a internet. Revisa tu red e inténtalo de nuevo."
        : error.message || "No se pudo buscar esa ciudad.";
    setLoading(false, message);
  } finally {
    window.clearTimeout(timeout);
  }
});

elements.locateButton.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    setLoading(false, "Tu navegador no permite compartir la ubicación.");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const place = {
          name: "Mi ubicación",
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await loadWeather(place, { announce: false });
      } catch (error) {
        setLoading(false, error.message || "No se pudo cargar el clima de tu ubicación.");
      }
    },
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Permite el acceso a tu ubicación para usar esta opción."
        : error.code === error.TIMEOUT
          ? "No pudimos obtener tu ubicación a tiempo. Inténtalo otra vez."
          : "No se pudo obtener tu ubicación.";
      setLoading(false, message);
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
});

elements.unitToggle.addEventListener("click", () => {
  state.unit = state.unit === "c" ? "f" : "c";
  renderUnits();
});

elements.themeToggle.addEventListener("click", () => {
  const nextTheme = state.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  try {
    localStorage.setItem("cielo-theme", nextTheme);
  } catch {
    elements.status.textContent = "El tema cambiará, pero el navegador no permite guardar la preferencia.";
  }
});

window.addEventListener("online", () => {
  if (elements.status.textContent.includes("conexión")) {
    setLoading(false, "Conexión restablecida. Actualizando el clima…");
    loadWeather(state.place);
  }
});

window.addEventListener("offline", () => {
  setLoading(false, "Sin conexión. Los datos actuales pueden estar desactualizados.");
});

elements.currentDate.textContent = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

applyTheme(state.theme);
loadWeather(DEFAULT_PLACE);
