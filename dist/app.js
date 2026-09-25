let stations = [
  { id: "KDCA", name: "Washington National", state: "DC", source: "NOAA", lat: 38.8521, lon: -77.0377, elevationFt: 15, gauge: true, rain: { 6: 0.18, 12: 0.42, 24: 0.86, 48: 1.24, 72: 1.51 } },
  { id: "KIAD", name: "Dulles International", state: "VA", source: "NOAA", lat: 38.9349, lon: -77.4473, elevationFt: 312, gauge: true, rain: { 6: 0.09, 12: 0.31, 24: 0.64, 48: 0.91, 72: 1.17 } },
  { id: "KBWI", name: "Baltimore / Washington", state: "MD", source: "NOAA", lat: 39.1733, lon: -76.684, elevationFt: 143, gauge: true, rain: { 6: 0.26, 12: 0.58, 24: 1.12, 48: 1.47, 72: 1.72 } },
  { id: "KRIC", name: "Richmond International", state: "VA", source: "NOAA", lat: 37.5052, lon: -77.3197, elevationFt: 167, gauge: true, rain: { 6: 0.04, 12: 0.16, 24: 0.37, 48: 0.62, 72: 0.77 } },
  { id: "KCHO", name: "Charlottesville–Albemarle", state: "VA", source: "NOAA", lat: 38.1386, lon: -78.4529, elevationFt: 640, gauge: true, rain: { 6: 0.0, 12: 0.08, 24: 0.21, 48: 0.54, 72: 0.69 } },
  { id: "KROA", name: "Roanoke Regional", state: "VA", source: "NOAA", lat: 37.3169, lon: -79.9741, elevationFt: 1175, gauge: true, rain: { 6: 0.0, 12: 0.02, 24: 0.14, 48: 0.28, 72: 0.41 } },
  { id: "KORF", name: "Norfolk International", state: "VA", source: "NOAA", lat: 36.8946, lon: -76.2012, elevationFt: 27, gauge: true, rain: { 6: 0.41, 12: 0.77, 24: 1.38, 48: 1.83, 72: 2.14 } },
  { id: "KSBY", name: "Salisbury Regional", state: "MD", source: "NOAA", lat: 38.3405, lon: -75.5103, elevationFt: 52, gauge: true, rain: { 6: 0.33, 12: 0.69, 24: 1.04, 48: 1.66, 72: 1.98 } },
  { id: "KLYH", name: "Lynchburg Regional", state: "VA", source: "NOAA", lat: 37.3267, lon: -79.2004, elevationFt: 938, gauge: true, rain: { 6: 0.0, 12: 0.05, 24: 0.18, 48: 0.39, 72: 0.48 } },
  { id: "KMRB", name: "Eastern WV Regional", state: "WV", source: "NOAA", lat: 39.4019, lon: -77.9846, elevationFt: 565, gauge: true, rain: { 6: 0.12, 12: 0.25, 24: 0.51, 48: 0.82, 72: 1.04 } },
  { id: "KNYG", name: "Quantico Marine Corps", state: "VA", source: "NOAA", lat: 38.5036, lon: -77.305, elevationFt: 10, gauge: false, rain: { 6: null, 12: null, 24: null, 48: null, 72: null } },
  { id: "KHEF", name: "Manassas Regional", state: "VA", source: "NOAA", lat: 38.7214, lon: -77.5154, elevationFt: 192, gauge: false, rain: { 6: null, 12: null, 24: null, 48: null, 72: null } },
];

const state = {
  selectedId: "KDCA",
  query: "",
  gaugeOnly: true,
  sortBy: "24",
  radiusMiles: 50,
  showPws: false,
  dataMode: "sample",
  areaSearchActive: false,
};

const PWS_RADIUS_MILES = 25;

const sampleStations = structuredClone(stations);

const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: "center",
  doubleClickZoom: "center",
  touchZoom: "center",
  attributionControl: true,
  minZoom: 5,
  preferCanvas: true,
}).setView([38.24, -77.55], 7);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const radiusCircle = L.circle(map.getCenter(), {
  radius: state.radiusMiles * 1609.344,
  color: "#58e3bd",
  weight: 1.5,
  opacity: 0.72,
  fillColor: "#58e3bd",
  fillOpacity: 0.035,
  dashArray: "7 7",
  interactive: false,
}).addTo(map);

const markers = new Map();
const rows = document.querySelector("#station-rows");
const card = document.querySelector("#station-card");
const count = document.querySelector("#station-count");
const empty = document.querySelector("#empty-state");
const search = document.querySelector("#station-search");
const gaugeOnly = document.querySelector("#gauge-only");
const sortBy = document.querySelector("#sort-by");
const refreshButton = document.querySelector("#refresh-button");
const dataStatus = document.querySelector("#data-status");
const updatedTime = document.querySelector("#updated-time");
const statusStrip = document.querySelector(".status-strip");
const dataPanel = document.querySelector(".data-panel");
const radiusSelect = document.querySelector("#radius-select");
const areaSearchButton = document.querySelector("#area-search-button");
const centerLabel = document.querySelector("#center-label");
const pwsToggle = document.querySelector("#show-pws");

function updateSearchGeometry() {
  const center = map.getCenter();
  radiusCircle.setLatLng(center).setRadius(state.radiusMiles * 1609.344);
  const latitude = `${Math.abs(center.lat).toFixed(2)}° ${center.lat >= 0 ? "N" : "S"}`;
  const longitude = `${Math.abs(center.lng).toFixed(2)}° ${center.lng >= 0 ? "E" : "W"}`;
  centerLabel.textContent = `${latitude}, ${longitude} · ${state.radiusMiles} mi`;
}

function fitSearchRadius(center = map.getCenter()) {
  radiusCircle.setLatLng(center).setRadius(state.radiusMiles * 1609.344);
  map.fitBounds(radiusCircle.getBounds(), { padding: [36, 36], animate: false });
}

function distanceMiles(a, b) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

function samplePointsForRadius(center, radiusMiles) {
  const points = [{ lat: center.lat, lng: center.lng }];
  const sampleDistance = radiusMiles * 0.68;
  const latStep = sampleDistance / 69;
  const lonStep = sampleDistance / Math.max(20, 69 * Math.cos((center.lat * Math.PI) / 180));
  for (const [north, east] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [0.7, -0.7], [-0.7, 0.7], [-0.7, -0.7]]) {
    points.push({ lat: center.lat + north * latStep, lng: center.lng + east * lonStep });
  }
  return points;
}

async function fetchNearbyStationCandidates(center, radiusMiles) {
  const pointResults = await Promise.allSettled(
    samplePointsForRadius(center, radiusMiles).map(async (point) => {
      const response = await fetch(`https://api.weather.gov/points/${point.lat.toFixed(4)},${point.lng.toFixed(4)}`, {
        headers: { Accept: "application/geo+json" },
      });
      if (!response.ok) throw new Error(`Point lookup failed: ${response.status}`);
      const payload = await response.json();
      return {
        collectionUrl: payload?.properties?.observationStations,
        stateCode: payload?.properties?.relativeLocation?.properties?.state,
      };
    }),
  );

  const pointMetadata = pointResults.filter((result) => result.status === "fulfilled").map((result) => result.value);
  const collectionUrls = [...new Set(pointMetadata.map((item) => item.collectionUrl).filter(Boolean))];
  const stateCodes = [...new Set(pointMetadata.map((item) => item.stateCode).filter(Boolean))];
  if (!collectionUrls.length) throw new Error("No NWS station collections were available for this area.");

  const collectionResults = await Promise.allSettled(
    collectionUrls.map(async (url) => {
      const response = await fetch(url, { headers: { Accept: "application/geo+json" } });
      if (!response.ok) throw new Error(`Station lookup failed: ${response.status}`);
      return response.json();
    }),
  );

  const candidates = new Map();
  for (const result of collectionResults) {
    if (result.status !== "fulfilled") continue;
    for (const feature of result.value?.features || []) {
      const [lon, lat] = feature?.geometry?.coordinates || [];
      const id = feature?.properties?.stationIdentifier;
      if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const miles = distanceMiles(center, { lat, lng: lon });
      if (miles > radiusMiles) continue;
      const existing = candidates.get(id);
      if (!existing || miles < existing.distanceMiles) {
        candidates.set(id, {
          id,
          name: feature.properties?.name || id,
          state: `${Math.round(miles)} mi`,
          source: "NOAA",
          lat,
          lon,
          elevationFt: convertElevationToFeet(feature.properties?.elevation),
          distanceMiles: miles,
          gauge: false,
          rain: { 6: null, 12: null, 24: null, 48: null, 72: null },
        });
      }
    }
  }

  return {
    candidates: [...candidates.values()].sort((a, b) => a.distanceMiles - b.distanceMiles),
    stateCodes,
  };
}

async function settleMap(items, mapper, concurrency = 8) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function fetchPwsCandidates(center, radiusMiles, stateCodes) {
  if (!stateCodes.length) return [];
  const results = await Promise.allSettled(
    stateCodes.map(async (stateCode) => {
      const params = new URLSearchParams({ state: stateCode, limit: "500" });
      const response = await fetch(`https://api.weather.gov/stations?${params}`, {
        headers: { Accept: "application/geo+json" },
      });
      if (!response.ok) throw new Error(`PWS lookup failed: ${response.status}`);
      return response.json();
    }),
  );

  const candidates = new Map();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const feature of result.value?.features || []) {
      const properties = feature?.properties || {};
      const provider = `${properties.provider || ""} ${properties.subProvider || ""}`.toUpperCase();
      if (!provider.includes("APRSWXNET") && !provider.includes("CWOP")) continue;
      const [lon, lat] = feature?.geometry?.coordinates || [];
      const id = properties.stationIdentifier;
      if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const miles = distanceMiles(center, { lat, lng: lon });
      if (miles > radiusMiles) continue;
      candidates.set(id, {
        id,
        name: properties.name || `Personal station ${id}`,
        state: `${Math.round(miles)} mi`,
        source: "PWS",
        network: "CWOP",
        lat,
        lon,
        elevationFt: convertElevationToFeet(properties.elevation),
        distanceMiles: miles,
        gauge: false,
        rain: { 6: null, 12: null, 24: null, 48: null, 72: null },
      });
    }
  }
  return [...candidates.values()].sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, 18);
}

function colorForRain(value) {
  if (value == null || value <= 0.01) return "#6f8f9b";
  if (value < 0.5) return "#4dc8f2";
  if (value < 1) return "#3f82f7";
  return "#7b65f6";
}

function levelForRain(value) {
  if (value == null || value <= 0.01) return 0;
  if (value < 0.25) return 1;
  if (value < 0.75) return 2;
  if (value < 1.25) return 3;
  return 4;
}

function formatRain(value) {
  return value == null ? "—" : value.toFixed(2);
}

function convertElevationToFeet(quantitativeValue) {
  const value = Number(quantitativeValue?.value);
  if (!Number.isFinite(value)) return null;
  const unit = `${quantitativeValue?.unitCode || ""}`.toLowerCase();
  if (unit.endsWith(":m")) return Math.round(value * 3.28084);
  if (unit.endsWith(":ft") || unit.includes("foot")) return Math.round(value);
  return null;
}

function formatElevation(value) {
  return Number.isFinite(value) ? `${Math.round(value).toLocaleString("en-US")} ft` : "Unavailable";
}

function nwsTimeSeriesUrl(stationId) {
  return `https://www.weather.gov/wrh/timeseries?site=${encodeURIComponent(stationId)}`;
}

function coordinateToDms(value, positiveDirection, negativeDirection) {
  let absolute = Math.abs(value);
  let degrees = Math.floor(absolute);
  let minutesDecimal = (absolute - degrees) * 60;
  let minutes = Math.floor(minutesDecimal);
  let seconds = Number(((minutesDecimal - minutes) * 60).toFixed(1));

  if (seconds >= 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes >= 60) {
    minutes = 0;
    degrees += 1;
  }

  return `${degrees}° ${minutes}′ ${seconds.toFixed(1)}″ ${value >= 0 ? positiveDirection : negativeDirection}`;
}

function stationCoordinates(station) {
  return {
    dd: `${station.lat.toFixed(5)}°, ${station.lon.toFixed(5)}°`,
    dms: `${coordinateToDms(station.lat, "N", "S")}, ${coordinateToDms(station.lon, "E", "W")}`,
  };
}

function getVisibleStations() {
  const query = state.query.trim().toLowerCase();
  return stations
    .filter((station) => station.source !== "PWS" || state.showPws)
    .filter((station) => station.source === "PWS" || !state.gaugeOnly || station.gauge)
    .filter((station) => !query || `${station.id} ${station.name} ${station.state}`.toLowerCase().includes(query))
    .sort((a, b) => {
      if (state.sortBy === "name") return a.name.localeCompare(b.name);
      return (b.rain[state.sortBy] ?? -1) - (a.rain[state.sortBy] ?? -1);
    });
}

function markerHtml(station, selected) {
  const classes = ["station-marker", station.source === "PWS" ? "pws" : "", selected ? "is-selected" : "", station.gauge ? "" : "no-gauge"]
    .filter(Boolean)
    .join(" ");
  return `<div class="${classes}" style="--marker-color: ${colorForRain(station.rain[24])}"></div>`;
}

function buildMarkers() {
  for (const marker of markers.values()) marker.remove();
  markers.clear();
  for (const station of stations) {
    const icon = L.divIcon({
      className: "rain-marker-wrap",
      html: markerHtml(station, station.id === state.selectedId),
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    const marker = L.marker([station.lat, station.lon], {
      icon,
      keyboard: true,
      title: `${station.name} (${station.id})`,
    }).addTo(map);
    marker.on("click", () => selectStation(station.id, { pan: false }));
    markers.set(station.id, marker);
  }
}

function setDataState(kind, label, detail) {
  statusStrip.classList.remove("is-live", "is-error", "is-loading");
  if (kind) statusStrip.classList.add(`is-${kind}`);
  dataStatus.textContent = label;
  updatedTime.textContent = detail;
}

function convertToInches(quantitativeValue) {
  const value = Number(quantitativeValue?.value);
  if (!Number.isFinite(value)) return null;
  const unit = quantitativeValue?.unitCode || "";
  if (unit.endsWith(":mm")) return Math.max(0, value / 25.4);
  if (unit.endsWith(":cm")) return Math.max(0, value / 2.54);
  if (unit.toLowerCase().includes("inch")) return Math.max(0, value);
  return Math.max(0, value / 25.4);
}

function rainTotalsFromObservations(features) {
  const observationsByHour = new Map();
  const hourMs = 60 * 60 * 1000;

  for (const feature of features) {
    const properties = feature?.properties || {};
    const timestamp = new Date(properties.timestamp);
    if (Number.isNaN(timestamp.getTime())) continue;
    const amount = convertToInches(properties.precipitationLastHour);
    if (amount == null) continue;

    const hour = new Date(timestamp);
    hour.setUTCMinutes(0, 0, 0);
    const key = hour.toISOString();
    const existing = observationsByHour.get(key);
    if (!existing || timestamp > existing.timestamp) observationsByHour.set(key, { timestamp, amount });
  }

  const referenceTime = new Date();
  const totals = {};
  for (const hours of [6, 12, 24, 48, 72]) {
    const windowEnd = referenceTime.getTime();
    const windowStart = windowEnd - hours * hourMs;
    const contributions = [...observationsByHour.values()].flatMap((item) => {
      const reportEnd = item.timestamp.getTime();
      const reportStart = reportEnd - hourMs;
      const overlap = Math.min(reportEnd, windowEnd) - Math.max(reportStart, windowStart);
      return overlap > 0 ? [item.amount * Math.min(1, overlap / hourMs)] : [];
    });
    totals[hours] = contributions.length
      ? Number(contributions.reduce((sum, amount) => sum + amount, 0).toFixed(2))
      : null;
  }
  return { totals, hasGauge: observationsByHour.size > 0 };
}

async function fetchStationObservations(station) {
  const end = new Date();
  const start = new Date(end.getTime() - 73 * 60 * 60 * 1000);
  const nwsTimestamp = (date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({ start: nwsTimestamp(start), end: nwsTimestamp(end), limit: "500" });
  let nextUrl = `https://api.weather.gov/stations/${station.id}/observations?${params}`;
  const features = [];

  for (let page = 0; page < 2 && nextUrl; page += 1) {
    const response = await fetch(nextUrl, { headers: { Accept: "application/geo+json" } });
    if (!response.ok) throw new Error(`${station.id}: ${response.status}`);
    const payload = await response.json();
    features.push(...(payload.features || []));
    nextUrl = payload.pagination?.next || null;
  }

  const { totals, hasGauge } = rainTotalsFromObservations(features);
  return { ...station, gauge: hasGauge, rain: totals };
}

async function refreshNoaaData() {
  if (refreshButton.disabled) return { status: "already-loading" };
  refreshButton.disabled = true;
  refreshButton.classList.add("is-loading");
  refreshButton.firstElementChild.textContent = "↻";
  dataPanel.setAttribute("aria-busy", "true");
  setDataState("loading", "Loading NOAA observations", "Up to 72 hours");

  const results = await settleMap(stations, fetchStationObservations);
  const successful = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
  const failures = results.length - successful.length;

  if (successful.length) {
    const successfulById = new Map(successful.map((station) => [station.id, station]));
    stations = stations.map((station) => successfulById.get(station.id) || station);
    state.dataMode = "live";
    buildMarkers();
    render();
    if (state.areaSearchActive) {
      updateAreaSearchStatus();
    } else {
      setDataState(
        "live",
        failures ? `Live NOAA · ${failures} unavailable` : "Live NOAA observations",
        `Updated ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date())}`,
      );
    }
  } else {
    stations = structuredClone(sampleStations);
    state.dataMode = "sample";
    state.areaSearchActive = false;
    buildMarkers();
    render();
    setDataState("error", "NOAA unavailable · sample shown", "Try again shortly");
  }

  refreshButton.disabled = false;
  refreshButton.classList.remove("is-loading");
  dataPanel.setAttribute("aria-busy", "false");
  return { status: successful.length ? "updated" : "fallback", updated: successful.length, failed: failures };
}

async function searchCurrentMapArea(options = {}) {
  if (areaSearchButton.disabled) return { status: "already-loading" };
  map.stop();
  const requestedCenter = options.center || map.getCenter();
  const center = L.latLng(requestedCenter.lat, requestedCenter.lng);
  const radiusMiles = options.radiusMiles || state.radiusMiles;
  state.radiusMiles = radiusMiles;
  radiusSelect.value = String(radiusMiles);
  if (options.center) map.setView(center, map.getZoom(), { animate: false });
  updateSearchGeometry();
  fitSearchRadius(center);

  areaSearchButton.disabled = true;
  refreshButton.disabled = true;
  dataPanel.setAttribute("aria-busy", "true");
  setDataState("loading", "Finding stations", `${radiusMiles} miles from map center`);

  try {
    const nearby = await fetchNearbyStationCandidates(center, radiusMiles);
    let pwsCandidates = [];
    if (state.showPws) {
      setDataState("loading", "Finding personal stations", `CWOP network · ${PWS_RADIUS_MILES} mi maximum`);
      pwsCandidates = await fetchPwsCandidates(center, Math.min(radiusMiles, PWS_RADIUS_MILES), nearby.stateCodes);
    }
    const candidates = [...nearby.candidates, ...pwsCandidates];
    if (!candidates.length) throw new Error("No stations were found inside this radius.");

    setDataState("loading", `Loading ${candidates.length} stations`, "Recent rainfall observations");
    const results = await settleMap(candidates, fetchStationObservations);
    stations = candidates.map((candidate, index) => results[index].status === "fulfilled" ? results[index].value : candidate);
    state.dataMode = "live";
    state.areaSearchActive = true;
    state.selectedId = stations[0].id;
    state.query = "";
    search.value = "";
    buildMarkers();
    render();
    const noaaCount = stations.filter((station) => station.source !== "PWS").length;
    const pwsCount = stations.filter((station) => station.source === "PWS").length;
    updateAreaSearchStatus();
    return { status: "updated", stations: stations.length, noaaCount, pwsCount, radiusMiles, center: { lat: center.lat, lon: center.lng } };
  } catch (error) {
    setDataState("error", "Area search unavailable", error.message || "Try a different center or radius");
    return { status: "error", message: error.message };
  } finally {
    areaSearchButton.disabled = false;
    refreshButton.disabled = false;
    dataPanel.setAttribute("aria-busy", "false");
  }
}

async function setPwsVisibility(enabled) {
  state.showPws = Boolean(enabled);
  pwsToggle.checked = state.showPws;
  if (state.showPws) return searchCurrentMapArea();

  stations = stations.filter((station) => station.source !== "PWS");
  if (!stations.some((station) => station.id === state.selectedId)) state.selectedId = stations[0]?.id;
  buildMarkers();
  render();
  updateAreaSearchStatus();
  return { status: "updated", personalStationsVisible: false, stations: stations.length };
}

function updateAreaSearchStatus() {
  if (!state.areaSearchActive) return;
  const visibleCount = getVisibleStations().length;
  const loadedCount = stations.length;
  const pwsCount = stations.filter((station) => station.source === "PWS").length;
  setDataState(
    "live",
    visibleCount === loadedCount ? `${loadedCount} stations shown` : `${visibleCount} of ${loadedCount} stations shown`,
    pwsCount ? `${state.radiusMiles} mi NOAA · ${PWS_RADIUS_MILES} mi PWS` : `${state.radiusMiles} mi search radius`,
  );
}

function renderMarkers(visible) {
  const visibleIds = new Set(visible.map((station) => station.id));
  for (const station of stations) {
    const marker = markers.get(station.id);
    if (visibleIds.has(station.id)) {
      if (!map.hasLayer(marker)) marker.addTo(map);
      marker.setIcon(
        L.divIcon({
          className: "rain-marker-wrap",
          html: markerHtml(station, station.id === state.selectedId),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      );
    } else if (map.hasLayer(marker)) {
      map.removeLayer(marker);
    }
  }
}

function renderRows(visible) {
  rows.innerHTML = visible
    .map(
      (station) => `
        <tr tabindex="0" data-station-id="${station.id}" class="${station.id === state.selectedId ? "is-selected" : ""}" aria-label="${station.name}, ${station.id}">
          <td>
            <div class="station-name-cell">
              <i class="${station.source === "PWS" ? "pws-symbol" : station.gauge ? "gauge-symbol" : "no-gauge-symbol"}" aria-hidden="true"></i>
              <span class="station-label">
                <strong>${station.name}</strong>
                <span>${station.id} · ${station.state}</span>
              </span>
            </div>
          </td>
          ${[6, 12, 24, 48, 72]
            .map(
              (period) => `<td class="rain-cell ${station.rain[period] == null ? "no-data" : ""}" data-level="${levelForRain(station.rain[period])}"><span>${formatRain(station.rain[period])}</span></td>`,
            )
            .join("")}
        </tr>`,
    )
    .join("");

  rows.querySelectorAll("tr").forEach((row) => {
    const activate = () => selectStation(row.dataset.stationId);
    row.addEventListener("click", activate);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

function renderCard() {
  const station = stations.find((item) => item.id === state.selectedId) ?? stations[0];
  const coordinates = stationCoordinates(station);
  const stationDataNote = station.source === "PWS"
    ? `<span>Rain totals are not available in this feed.</span>
       <a href="${nwsTimeSeriesUrl(station.id)}" target="_blank" rel="noopener noreferrer">View NWS rainfall history <span aria-hidden="true">↗</span></a>`
    : `<span>${state.dataMode === "sample" ? "Sample value · refresh for live totals" : "Rolling estimate ending now · NWS"}</span>
       <a href="${nwsTimeSeriesUrl(station.id)}" target="_blank" rel="noopener noreferrer">View NWS source data <span aria-hidden="true">↗</span></a>`;
  card.innerHTML = `
    <div class="station-card-head">
      <div>
        <p>${station.state} · ${station.source === "PWS" ? "Personal station · CWOP" : station.gauge ? "NOAA rain gauge reporting" : "No recent rain gauge data"}</p>
        <h2>${station.name}</h2>
        <div class="station-coordinates" aria-label="Station coordinates and elevation">
          <span><b>DD</b><code>${coordinates.dd}</code></span>
          <span><b>DMS</b><code>${coordinates.dms}</code></span>
          <span><b>ELEV</b><code>${formatElevation(station.elevationFt)}</code></span>
        </div>
      </div>
      <span class="station-card-id">${station.id}</span>
    </div>
    <div class="station-metrics">
      ${[6, 12, 24, 48, 72]
        .map((period) => `<div><span>${period} hours</span><strong>${formatRain(station.rain[period])}${station.rain[period] == null ? "" : '″'}</strong></div>`)
        .join("")}
    </div>
    <div class="station-data-note">${stationDataNote}</div>
  `;
}

function render() {
  const visible = getVisibleStations();
  count.textContent = `${visible.length} station${visible.length === 1 ? "" : "s"}`;
  empty.hidden = visible.length > 0;
  renderRows(visible);
  renderMarkers(visible);
  renderCard();
}

function selectStation(id, options = { pan: true }) {
  const station = stations.find((item) => item.id === id);
  if (!station) return;
  state.selectedId = id;
  render();
  if (options.pan !== false) map.flyTo([station.lat, station.lon], Math.max(map.getZoom(), 9), { duration: 0.55 });
  requestAnimationFrame(() => rows.querySelector(`[data-station-id="${id}"]`)?.scrollIntoView({ block: "nearest" }));
}

function fitVisibleStations() {
  const visible = getVisibleStations();
  if (!visible.length) return;
  map.fitBounds(L.latLngBounds(visible.map((station) => [station.lat, station.lon])), { padding: [48, 48], maxZoom: 9 });
}

search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
  updateAreaSearchStatus();
});

gaugeOnly.addEventListener("change", (event) => {
  state.gaugeOnly = event.target.checked;
  render();
  updateAreaSearchStatus();
});

sortBy.addEventListener("change", (event) => {
  state.sortBy = event.target.value;
  render();
});

document.querySelector("#fit-button").addEventListener("click", fitVisibleStations);

refreshButton.addEventListener("click", refreshNoaaData);

radiusSelect.addEventListener("change", (event) => {
  state.radiusMiles = Number(event.target.value);
  updateSearchGeometry();
});

areaSearchButton.addEventListener("click", () => searchCurrentMapArea());
map.on("move", updateSearchGeometry);

pwsToggle.addEventListener("change", (event) => {
  void setPwsVisibility(event.target.checked);
});

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const register = (tool) => {
    try {
      void Promise.resolve(context.registerTool(tool)).catch(() => {});
    } catch {
      // The page remains fully functional when WebMCP is unavailable.
    }
  };

  register({
    name: "filter_weather_stations",
    title: "Filter weather stations",
    description: "Filter the visible NOAA weather stations by name or station ID, and optionally show only stations with recent rain-gauge reports.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Station name, ID, or state abbreviation." },
        gaugesOnly: { type: "boolean", description: "Whether to show only stations with recent precipitation reports." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input = {}) {
      if (typeof input.query === "string") {
        state.query = input.query.slice(0, 80);
        search.value = state.query;
      }
      if (typeof input.gaugesOnly === "boolean") {
        state.gaugeOnly = input.gaugesOnly;
        gaugeOnly.checked = input.gaugesOnly;
      }
      render();
      const visible = getVisibleStations();
      return { visibleStations: visible.length, stationIds: visible.map((station) => station.id) };
    },
  });

  register({
    name: "search_weather_stations_by_map_area",
    title: "Search weather stations by map area",
    description: "Use the map center as the starting point, search within a radius, and load nearby NWS station rainfall observations.",
    inputSchema: {
      type: "object",
      properties: {
        radiusMiles: { type: "number", enum: [25, 50, 100, 150, 200], description: "Search radius in miles." },
        latitude: { type: "number", minimum: -90, maximum: 90, description: "Optional starting latitude; defaults to the map center." },
        longitude: { type: "number", minimum: -180, maximum: 180, description: "Optional starting longitude; defaults to the map center." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input = {}) {
      const hasCoordinates = Number.isFinite(input.latitude) && Number.isFinite(input.longitude);
      const center = hasCoordinates ? L.latLng(input.latitude, input.longitude) : map.getCenter();
      return searchCurrentMapArea({ center, radiusMiles: input.radiusMiles || state.radiusMiles });
    },
  });

  register({
    name: "set_personal_weather_stations",
    title: "Show or hide personal weather stations",
    description: `Add or remove nearby CWOP personal weather stations within ${PWS_RADIUS_MILES} miles of the current map center.`,
    inputSchema: {
      type: "object",
      properties: { enabled: { type: "boolean", description: "Whether personal weather stations should be included." } },
      required: ["enabled"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input) {
      return setPwsVisibility(Boolean(input?.enabled));
    },
  });

  register({
    name: "select_weather_station",
    title: "Select weather station",
    description: "Select a visible NOAA station and center the map on it.",
    inputSchema: {
      type: "object",
      properties: { stationId: { type: "string", description: "NOAA station ID, such as KDCA." } },
      required: ["stationId"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const id = String(input?.stationId || "").toUpperCase();
      const station = stations.find((item) => item.id === id);
      if (!station) throw new Error(`Unknown station ID: ${id}`);
      selectStation(id);
      return { stationId: id, stationName: station.name, rainfall: station.rain };
    },
  });

  register({
    name: "read_visible_rainfall",
    title: "Read visible rainfall",
    description: "Read the rainfall matrix for the stations currently visible in the table.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute() {
      return {
        units: "inches",
        stations: getVisibleStations().map(({ id, name, state: area, source, gauge, rain }) => ({ id, name, area, source, gauge, rain })),
      };
    },
  });

  register({
    name: "refresh_noaa_observations",
    title: "Refresh NOAA observations",
    description: "Request the latest precipitation observations for the displayed NOAA stations and update the map and matrix.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute: refreshNoaaData,
  });
}

buildMarkers();
render();
fitVisibleStations();
updateSearchGeometry();
registerWebMcpTools();
refreshNoaaData();
