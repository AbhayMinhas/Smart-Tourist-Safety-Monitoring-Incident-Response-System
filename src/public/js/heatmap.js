let heatLayer = null;
let zoomEndHandler = null;
let currentVisibility = false;

const severityWeight = {
  theft: 0.5,
  accident: 1.0,
  harassment: 0.8,
  other: 0.4,
};

const MIN_ZOOM_TO_SHOW = 14;  // ✅ disappears below this zoom

export function renderHeatmap(map, incidents, isVisible) {
  currentVisibility = isVisible;

  if (heatLayer) map.removeLayer(heatLayer);

  const points = incidents.map((i) => {
    const [lng, lat] = i.coordinates;
    const weight = severityWeight[i.type] || 0.5;
    return [lat, lng, weight];
  });

  function getRadiusForZoom(zoom) {
    if (zoom >= 17) return 40;
    if (zoom >= 16) return 50;
    if (zoom >= 15) return 60;
    if (zoom >= 14) return 70;
    if (zoom >= 13) return 80;
    if (zoom >= 12) return 90;
    return 100;  // max size just before disappearing
  }

  function buildHeatLayer() {
    if (heatLayer) map.removeLayer(heatLayer);

    const zoom = map.getZoom();

    heatLayer = L.heatLayer(points, {
      radius: getRadiusForZoom(zoom),
      blur: 20,
      minOpacity: 0.7,
      max: 1.0,
      gradient: {
        0.0: "transparent",
        0.3: "#ffff00",
        0.5: "#ff8800",
        0.7: "#ff2200",
        0.9: "#cc0000",
        1.0: "#7f0000",
      },
    });

    // ✅ only add if visible AND zoom is above minimum threshold
    if (currentVisibility && zoom >= MIN_ZOOM_TO_SHOW) {
      heatLayer.addTo(map);
    }
  }

  buildHeatLayer();

  if (zoomEndHandler) map.off("zoomend", zoomEndHandler);
  zoomEndHandler = () => buildHeatLayer();  // ✅ rebuilds on every zoom, adds/removes based on threshold
  map.on("zoomend", zoomEndHandler);
}

export function toggleHeatmap(map, clusterGroup, state) {
  const { isHeatmapVisible } = state;
  currentVisibility = isHeatmapVisible;  // ✅ keep in sync

  if (isHeatmapVisible) {
    map.removeLayer(clusterGroup);
    // ✅ only show if zoom is above threshold
    if (heatLayer && map.getZoom() >= MIN_ZOOM_TO_SHOW) {
      heatLayer.addTo(map);
    }
  } else {
    map.addLayer(clusterGroup);
    if (heatLayer) map.removeLayer(heatLayer);
  }
}