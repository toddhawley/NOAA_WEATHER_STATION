# RainScope

RainScope is a local, static NOAA weather-station viewer. It combines an interactive OpenStreetMap map with a rainfall matrix for the last 6, 12, 24, and 48 hours.

## Run locally

1. Open a terminal in this folder.
2. Run `node server.mjs`.
3. Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The page starts with a representative Mid-Atlantic sample, then automatically requests recent observations from the National Weather Service API. Select **Refresh data** to request them again. If the live request fails, the sample remains visible and is explicitly labeled as a fallback. Live rainfall totals are rolling estimates ending at the current browser time. They use the latest `precipitationLastHour` report in each UTC hour, with a prorated contribution from a report that crosses the start or end of the selected window.

To search somewhere else, pan the map until the desired starting point is under the center crosshair, choose a radius from 25 to 200 miles, and select **Search this area**. The default search radius is 50 miles. All zoom gestures stay anchored to the map center so changing zoom does not move the search center. RainScope fits the map to the selected search boundary, discovers NWS observation stations, and loads every station found inside it. Observation requests are processed in small concurrent groups to avoid overwhelming the NWS service. When **Rain gauges only** is enabled, the matrix and map show only the loaded stations that supplied recent precipitation data; the result count reports both the shown and loaded totals.

Enable **Personal stations** to add up to 18 nearby CWOP personal weather stations identified through NOAA/MADIS provider metadata. PWS searches are intentionally capped at 25 miles from the map center, even when the NOAA search radius is larger. NOAA/NWS stations use circular map markers; PWS/CWOP stations use amber-edged diamonds. Some PWS records do not expose precipitation through the NWS observation feed, so their rainfall cells remain blank when no report is available.

Every selected station card links to NOAA's nationwide Time Series Viewer using the station identifier. NOAA/NWS stations show a **View NWS source data** link, while personal stations show **View NWS rainfall history**, where reported and accumulated precipitation can be inspected directly.

The Time Series Viewer may show a different multi-hour total because its multi-hour fields are station-reported accumulations anchored to individual observation timestamps. RainScope instead estimates the requested number of hours backward from the current time using the hourly precipitation fields available through the public NWS observations API.

Every selected-station card displays its location in both signed decimal degrees (DD) and degrees, minutes, seconds (DMS), with the station elevation in feet directly below the coordinates.

The base map uses OpenStreetMap tiles and requires an internet connection. NOAA refreshes also require internet access. If the NOAA request is unavailable, the page keeps the sample dataset visible and reports the fallback in the header.
