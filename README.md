# RainScope

RainScope is a local, static NOAA weather-station viewer. It combines an interactive OpenStreetMap map with a rainfall matrix for the last 6, 12, 24, and 48 hours.

## Run locally

1. Open a terminal in this folder.
2. Run `node server.mjs`.
3. Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The page starts with a representative Mid-Atlantic sample so it is immediately usable. Select **Refresh data** to request recent observations from the National Weather Service API. Live rainfall totals are estimated by taking the latest `precipitationLastHour` report in each UTC hour and summing those hourly observations.

To search somewhere else, pan the map until the desired starting point is under the center crosshair, choose a radius from 25 to 200 miles, and select **Search this area**. The default search radius is 50 miles. RainScope discovers nearby NWS observation stations and loads rainfall for up to the 28 nearest stations inside the boundary.

Enable **Personal stations** to add up to 18 nearby CWOP personal weather stations identified through NOAA/MADIS provider metadata. PWS searches are intentionally capped at 25 miles from the map center, even when the NOAA search radius is larger. NOAA/NWS stations use circular map markers; PWS/CWOP stations use amber-edged diamonds. Some PWS records do not expose precipitation through the NWS observation feed, so their rainfall cells remain blank when no report is available.

When a personal station is selected, its card includes a **View NWS rainfall history** link. The link opens NOAA's nationwide Time Series Viewer using that station's CWOP identifier, where reported and accumulated precipitation can be inspected directly.

Every selected-station card displays its location in both signed decimal degrees (DD) and degrees, minutes, seconds (DMS), with the station elevation in feet directly below the coordinates.

The base map uses OpenStreetMap tiles and requires an internet connection. NOAA refreshes also require internet access. If the NOAA request is unavailable, the page keeps the sample dataset visible and reports the fallback in the header.
