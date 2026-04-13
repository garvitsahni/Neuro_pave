'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sensor } from '@/lib/mock-data';

interface LeafletMapProps {
  sensors: Sensor[];
  selectedId: string | null;
  onSensorClick: (sensor: Sensor) => void;
  showHeatmap: boolean;
  showConnections: boolean;
  mapStyle: 'dark' | 'satellite';
}

// ─── CSS ────────────────────────────────────────────────────────────────────
const mapCSS = `
  .leaflet-container {
    background: #0a0d1f !important;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5) !important;
    margin-left: 12px !important;
    margin-top: 12px !important;
  }
  .leaflet-control-zoom a {
    background: rgba(8,10,24,0.92) !important;
    color: rgba(255,255,255,0.55) !important;
    border: 1px solid rgba(255,255,255,0.09) !important;
    backdrop-filter: blur(14px);
    width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;
    font-size: 17px !important;
    transition: all 0.18s ease;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
  .leaflet-control-zoom a:hover {
    background: rgba(16, 20, 48, 0.97) !important;
    color: rgba(255,255,255,0.9) !important;
    border-color: rgba(16,185,129,0.35) !important;
    box-shadow: 0 0 12px rgba(16,185,129,0.15) !important;
  }
  .leaflet-control-zoom-in {
    border-radius: 10px 10px 0 0 !important;
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  }
  .leaflet-control-zoom-out {
    border-radius: 0 0 10px 10px !important;
  }
  .leaflet-control-attribution {
    background: rgba(8,10,24,0.72) !important;
    color: rgba(255,255,255,0.18) !important;
    font-size: 9px !important;
    backdrop-filter: blur(8px);
    border-radius: 8px 0 0 0 !important;
    padding: 3px 8px !important;
    letter-spacing: 0.02em;
  }
  .leaflet-control-attribution a {
    color: rgba(16,185,129,0.45) !important;
  }

  /* ── Popup ─────────────────────────────────────────────────────────── */
  .sensor-popup .leaflet-popup-content-wrapper {
    background: rgba(8,10,24,0.97) !important;
    border: 1px solid rgba(255,255,255,0.09) !important;
    border-radius: 16px !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) !important;
    backdrop-filter: blur(24px);
    color: white;
    padding: 0 !important;
    overflow: hidden;
  }
  .sensor-popup .leaflet-popup-tip-container {
    margin-top: -1px;
  }
  .sensor-popup .leaflet-popup-tip {
    background: rgba(8,10,24,0.97) !important;
    box-shadow: none !important;
  }
  .sensor-popup .leaflet-popup-content {
    margin: 0 !important;
    font-family: 'Inter', system-ui, sans-serif;
    min-width: 0 !important;
  }
  .leaflet-popup-close-button {
    display: none !important;
  }

  /* ── Marker base ────────────────────────────────────────────────────── */
  .custom-sensor-marker {
    background: transparent !important;
    border: none !important;
  }
  .marker-shell {
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform;
    cursor: pointer;
  }
  .leaflet-marker-icon:hover .marker-shell {
    transform: scale(1.28) !important;
  }

  /* ── Pulse rings ────────────────────────────────────────────────────── */
  @keyframes ring-pulse {
    0%   { transform: scale(0.85); opacity: 0.7; }
    70%  { transform: scale(1.7);  opacity: 0; }
    100% { transform: scale(0.85); opacity: 0; }
  }
  @keyframes ring-pulse-slow {
    0%   { transform: scale(0.9); opacity: 0.5; }
    70%  { transform: scale(2.0); opacity: 0; }
    100% { transform: scale(0.9); opacity: 0; }
  }
  .pulse-ring {
    animation: ring-pulse 1.9s ease-out infinite;
    transform-origin: center center;
  }
  .pulse-ring-2 {
    animation: ring-pulse-slow 1.9s ease-out infinite 0.6s;
    transform-origin: center center;
  }

  /* ── Selected marker dashed ring ────────────────────────────────────── */
  @keyframes spin-dash {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .selected-ring {
    animation: spin-dash 8s linear infinite;
    transform-origin: center center;
  }

  /* ── Heatmap cluster fade in ─────────────────────────────────────────── */
  .leaflet-overlay-pane svg path {
    transition: fill-opacity 0.4s ease, stroke-opacity 0.4s ease;
  }

  /* ── Connection line fade ────────────────────────────────────────────── */
  .leaflet-overlay-pane svg .connection-line {
    stroke-dashoffset: 0;
    animation: dash-flow 3s linear infinite;
  }
  @keyframes dash-flow {
    from { stroke-dashoffset: 24; }
    to   { stroke-dashoffset: 0; }
  }

  /* ── Tooltip ─────────────────────────────────────────────────────────── */
  .sensor-tooltip {
    background: rgba(8,10,24,0.9) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 8px !important;
    color: rgba(255,255,255,0.8) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    padding: 4px 9px !important;
    backdrop-filter: blur(12px);
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
  }
  .sensor-tooltip::before { display: none !important; }

  /* ── Map overlay fade in ─────────────────────────────────────────────── */
  @keyframes map-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .map-ready {
    animation: map-fade-in 0.5s ease forwards;
  }
`;

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { main: string; glow: string; rgb: string }> = {
  operational: { main: '#22c55e', glow: '#16a34a', rgb: '34,197,94' },
  warning:     { main: '#f59e0b', glow: '#d97706', rgb: '245,158,11' },
  critical:    { main: '#f43f5e', glow: '#e11d48', rgb: '244,63,94' },
  offline:     { main: '#6b7280', glow: '#4b5563', rgb: '107,114,128' },
};

const TYPE_LETTERS: Record<string, string> = {
  vibration: 'V', strain: 'S', temperature: 'T', humidity: 'H',
};

const TYPE_COLORS: Record<string, string> = {
  vibration: '#3b82f6', strain: '#22c55e', temperature: '#f59e0b', humidity: '#8b5cf6',
};

const TILE_LAYERS = {
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRS = {
  dark:      '&copy; <a href="https://carto.com/">CARTO</a>',
  satellite: '&copy; Esri',
};

// ─── Icon Factory ────────────────────────────────────────────────────────────
const createSensorIcon = (sensor: Sensor, isSelected: boolean): L.DivIcon => {
  const col = STATUS_COLORS[sensor.status] ?? STATUS_COLORS.offline;
  const letter = TYPE_LETTERS[sensor.type] ?? '?';
  const typeCol = TYPE_COLORS[sensor.type] ?? '#ffffff';
  const size = isSelected ? 38 : 26;
  const isCritical = sensor.status === 'critical';
  const isWarning  = sensor.status === 'warning';
  const needsPulse = isCritical || isWarning;

  // Dual-ring pulse for critical, single for warning
  const pulseHTML = needsPulse ? `
    <div class="pulse-ring" style="
      position:absolute; inset:-5px;
      border-radius:50%;
      border: 1.5px solid ${col.main};
      pointer-events:none;
    "></div>
    ${isCritical ? `<div class="pulse-ring-2" style="
      position:absolute; inset:-5px;
      border-radius:50%;
      border: 1px solid ${col.main};
      opacity:0.4;
      pointer-events:none;
    "></div>` : ''}
  ` : '';

  // Selected: spinning dashed outer ring
  const selectedRingHTML = isSelected ? `
    <div class="selected-ring" style="
      position:absolute;
      top:-8px; left:-8px;
      width:${size + 16}px; height:${size + 16}px;
      border-radius:50%;
      border: 2px dashed rgba(255,255,255,0.45);
      pointer-events:none;
      box-sizing:border-box;
    "></div>
  ` : '';

  // Inner face gradient — use type colour as subtle inner ring accent
  const innerHTML = `
    <div style="
      position:absolute; inset:0;
      border-radius:50%;
      background: radial-gradient(circle at 32% 28%, ${col.main}ff 0%, ${col.glow}cc 60%, ${col.glow}88 100%);
      border: ${isSelected ? '2.5px solid rgba(255,255,255,0.85)' : `2px solid ${col.main}c0`};
      box-shadow:
        0 0 ${isSelected ? 22 : 14}px ${col.main}60,
        0 0 ${isSelected ? 40 : 20}px ${col.main}20,
        inset 0 1px 2px rgba(255,255,255,0.25),
        0 3px 10px rgba(0,0,0,0.55);
      display:flex; align-items:center; justify-content:center;
      box-sizing:border-box;
    ">
      <span style="
        font-size:${isSelected ? 15 : 10}px;
        font-weight:900;
        color:rgba(255,255,255,0.95);
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        font-family:'Inter',system-ui,sans-serif;
        letter-spacing:-0.03em;
        line-height:1;
      ">${letter}</span>
    </div>
    <!-- type accent dot -->
    <div style="
      position:absolute;
      bottom:${isSelected ? 1 : 0}px;
      right:${isSelected ? 1 : 0}px;
      width:${isSelected ? 9 : 7}px;
      height:${isSelected ? 9 : 7}px;
      border-radius:50%;
      background:${typeCol};
      border:1.5px solid rgba(8,10,24,0.8);
      box-shadow: 0 0 6px ${typeCol}80;
    "></div>
  `;

  return L.divIcon({
    className: 'custom-sensor-marker',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size / 2 - 6],
    html: `
      <div class="marker-shell" style="position:relative;width:${size}px;height:${size}px;">
        ${pulseHTML}
        ${selectedRingHTML}
        ${innerHTML}
      </div>
    `,
  });
};

// ─── Popup content ───────────────────────────────────────────────────────────
const createPopupContent = (sensor: Sensor): string => {
  const col = STATUS_COLORS[sensor.status] ?? STATUS_COLORS.offline;
  const typeCol = TYPE_COLORS[sensor.type] ?? '#ffffff';
  const letter = TYPE_LETTERS[sensor.type] ?? '?';

  const statusDot = sensor.status === 'critical' || sensor.status === 'warning'
    ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${col.main};box-shadow:0 0 8px ${col.main};margin-right:5px;vertical-align:middle;animation:ring-pulse 1.9s ease-out infinite;"></span>`
    : `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${col.main};box-shadow:0 0 6px ${col.main}80;margin-right:5px;vertical-align:middle;"></span>`;

  const lastUpdateStr = (() => {
    const d = typeof sensor.lastUpdate === 'string' ? new Date(sensor.lastUpdate) : sensor.lastUpdate;
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  })();

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;min-width:230px;max-width:270px;">
      <!-- header bar with type colour accent -->
      <div style="height:3px;background:linear-gradient(90deg,${typeCol},${col.main});border-radius:16px 16px 0 0;"></div>

      <div style="padding:13px 15px 12px;">
        <!-- sensor name row -->
        <div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:9px;">
          <div style="
            width:30px;height:30px;flex-shrink:0;
            border-radius:8px;
            background:radial-gradient(circle at 35% 35%,${col.main}dd,${col.glow}99);
            border:1px solid ${col.main}50;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 12px ${col.main}30;
          ">
            <span style="font-size:13px;font-weight:900;color:rgba(255,255,255,0.95);text-shadow:0 1px 2px rgba(0,0,0,0.4);">${letter}</span>
          </div>
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-size:12.5px;font-weight:700;color:rgba(255,255,255,0.92);line-height:1.3;letter-spacing:-0.01em;word-break:break-word;">${sensor.name}</p>
            <p style="margin:2px 0 0;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.4;">${sensor.location}</p>
          </div>
        </div>

        <!-- divider -->
        <div style="height:1px;background:linear-gradient(90deg,rgba(255,255,255,0.07),transparent);margin-bottom:9px;"></div>

        <!-- stats grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px;">
          <div style="padding:7px 9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;">
            <p style="margin:0;font-size:8.5px;color:rgba(255,255,255,0.22);text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Type</p>
            <p style="margin:3px 0 0;font-size:11px;color:${typeCol};font-weight:700;text-transform:capitalize;">${sensor.type}</p>
          </div>
          <div style="padding:7px 9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;">
            <p style="margin:0;font-size:8.5px;color:rgba(255,255,255,0.22);text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Status</p>
            <p style="margin:3px 0 0;font-size:11px;font-weight:700;text-transform:capitalize;display:flex;align-items:center;">${statusDot}<span style="color:${col.main}">${sensor.status}</span></p>
          </div>
          <div style="padding:7px 9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;">
            <p style="margin:0;font-size:8.5px;color:rgba(255,255,255,0.22);text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Lat / Lng</p>
            <p style="margin:3px 0 0;font-size:10px;color:rgba(255,255,255,0.45);font-family:monospace;white-space:nowrap;">${sensor.latitude.toFixed(4)}, ${sensor.longitude.toFixed(4)}</p>
          </div>
          <div style="padding:7px 9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;">
            <p style="margin:0;font-size:8.5px;color:rgba(255,255,255,0.22);text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Updated</p>
            <p style="margin:3px 0 0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:600;">${lastUpdateStr}</p>
          </div>
        </div>

        <!-- sensor ID footer -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:7px;border-top:1px solid rgba(255,255,255,0.05);">
          <span style="font-size:9px;color:rgba(255,255,255,0.18);text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">ID</span>
          <span style="font-size:9.5px;color:rgba(255,255,255,0.35);font-family:monospace;">${sensor.id}</span>
        </div>
      </div>
    </div>
  `;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function LeafletMap({
  sensors,
  selectedId,
  onSensorClick,
  showHeatmap,
  showConnections,
  mapStyle,
}: LeafletMapProps) {
  const mapRef            = useRef<L.Map | null>(null);
  const containerRef      = useRef<HTMLDivElement>(null);
  const markersRef        = useRef<Map<string, L.Marker>>(new Map());
  const connectionLayerRef= useRef<L.LayerGroup | null>(null);
  const heatLayerRef      = useRef<L.LayerGroup | null>(null);
  const tileLayerRef      = useRef<L.TileLayer | null>(null);
  const prevSelectedRef   = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Inject CSS once ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'neuropave-leaflet-css';
    if (!document.getElementById('neuropave-leaflet-css')) {
      el.textContent = mapCSS;
      document.head.appendChild(el);
    }
    return () => { el.remove(); };
  }, []);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [28.61, 77.20],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    const tileOpts: L.TileLayerOptions = {
      attribution: TILE_ATTRS.dark,
      maxZoom: 19,
      subdomains: 'abcd',
    };
    
    const tile = L.tileLayer(TILE_LAYERS[mapStyle], {
      ...tileOpts,
      attribution: TILE_ATTRS[mapStyle],
      ...(mapStyle === 'dark' ? { subdomains: 'abcd' } : {})
    }).addTo(map);

    tileLayerRef.current = tile;
    connectionLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Small delay so tiles start loading before we mark ready
    const t = setTimeout(() => setMapReady(true), 120);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ── Tile layer switch ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!tileLayerRef.current || !mapRef.current) return;
    
    if (tileLayerRef.current) {
        tileLayerRef.current.remove();
    }
    
    const tile = L.tileLayer(TILE_LAYERS[mapStyle], {
        attribution: TILE_ATTRS[mapStyle],
        maxZoom: 19,
        ...(mapStyle === 'dark' ? { subdomains: 'abcd' } : {})
    }).addTo(mapRef.current);
    
    tileLayerRef.current = tile;
  }, [mapStyle]);

  // ── Stable click handler ref ──────────────────────────────────────────────
  const onSensorClickRef = useRef(onSensorClick);
  useEffect(() => { onSensorClickRef.current = onSensorClick; }, [onSensorClick]);

  // ── Update markers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;
    const existing = new Set(markersRef.current.keys());
    const incoming = new Set(sensors.map(s => s.id));

    // Remove stale markers
    existing.forEach(id => {
      if (!incoming.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    sensors.forEach(sensor => {
      const isSelected = sensor.id === selectedId;
      const icon = createSensorIcon(sensor, isSelected);
      const existing = markersRef.current.get(sensor.id);

      if (existing) {
        existing.setLatLng([sensor.latitude, sensor.longitude]);
        existing.setIcon(icon);
        existing.setPopupContent(createPopupContent(sensor));
      } else {
        const marker = L.marker([sensor.latitude, sensor.longitude], {
          icon,
          riseOnHover: true,
          riseOffset: 400,
        })
          .addTo(map)
          .bindPopup(createPopupContent(sensor), {
            className: 'sensor-popup',
            maxWidth: 280,
            closeButton: false,
            autoPan: true,
            autoPanPadding: [24, 24],
          })
          .bindTooltip(sensor.name, {
            className: 'sensor-tooltip',
            direction: 'top',
            offset: [0, -14],
            opacity: 1,
          });

        marker.on('click', () => {
          onSensorClickRef.current(sensor);
        });

        markersRef.current.set(sensor.id, marker);
      }
    });
  }, [sensors, selectedId, mapReady]);

  // ── Update connection lines ───────────────────────────────────────────────
  useEffect(() => {
    if (!connectionLayerRef.current || !mapReady) return;
    connectionLayerRef.current.clearLayers();
    if (!showConnections) return;

    // Group by location name
    const groups: Record<string, Sensor[]> = {};
    sensors.forEach(s => {
      groups[s.location] = groups[s.location] || [];
      groups[s.location].push(s);
    });

    Object.values(groups).forEach(grp => {
      if (grp.length < 2) return;
      const hasCrit = grp.some(s => s.status === 'critical');
      const hasWarn = grp.some(s => s.status === 'warning');

      // Colour and dash pattern by severity
      const strokeColor = hasCrit ? '#f43f5e' : hasWarn ? '#f59e0b' : '#22c55e';
      const opacity     = hasCrit ? 0.55 : hasWarn ? 0.45 : 0.3;
      const dashArray   = hasCrit ? '4 5' : hasWarn ? '5 7' : '6 9';
      const weight      = hasCrit ? 1.8 : 1.2;

      for (let i = 0; i < grp.length - 1; i++) {
        for (let j = i + 1; j < grp.length; j++) {
          L.polyline(
            [
              [grp[i].latitude, grp[i].longitude],
              [grp[j].latitude, grp[j].longitude],
            ],
            {
              color: strokeColor,
              weight,
              dashArray,
              opacity,
              className: 'connection-line',
            }
          ).addTo(connectionLayerRef.current!);
        }
      }
    });
  }, [sensors, showConnections, mapReady]);

  // ── Update heatmap ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!heatLayerRef.current || !mapReady) return;
    heatLayerRef.current.clearLayers();
    if (!showHeatmap) return;

    // Cluster sensors by location, average their coords
    const clusterMap: Record<string, { sumLat: number; sumLng: number; sensors: Sensor[] }> = {};
    sensors.forEach(sensor => {
      if (!clusterMap[sensor.location]) {
        clusterMap[sensor.location] = { sumLat: 0, sumLng: 0, sensors: [] };
      }
      clusterMap[sensor.location].sensors.push(sensor);
      clusterMap[sensor.location].sumLat += sensor.latitude;
      clusterMap[sensor.location].sumLng += sensor.longitude;
    });

    Object.values(clusterMap).forEach(cluster => {
      const n = cluster.sensors.length;
      const lat = cluster.sumLat / n;
      const lng = cluster.sumLng / n;

      const hasCritical   = cluster.sensors.some(s => s.status === 'critical');
      const hasWarning    = cluster.sensors.some(s => s.status === 'warning');
      const hasOffline    = cluster.sensors.some(s => s.status === 'offline');
      const isOperational = !hasCritical && !hasWarning && !hasOffline;

      const col         = hasCritical ? STATUS_COLORS.critical
                        : hasWarning  ? STATUS_COLORS.warning
                        : hasOffline  ? STATUS_COLORS.offline
                        : STATUS_COLORS.operational;

      // Outer soft glow circle
      L.circle([lat, lng], {
        radius:      hasCritical ? 750 : hasWarning ? 620 : 500,
        color:       col.main,
        weight:      0,
        fillColor:   col.main,
        fillOpacity: hasCritical ? 0.10 : hasWarning ? 0.07 : 0.04,
      }).addTo(heatLayerRef.current!);

      // Inner tighter ring with dashed border
      L.circle([lat, lng], {
        radius:      hasCritical ? 400 : hasWarning ? 320 : 250,
        color:       col.main,
        weight:      1,
        dashArray:   '4 8',
        fillColor:   col.main,
        fillOpacity: hasCritical ? 0.16 : hasWarning ? 0.10 : 0.05,
        opacity:     hasCritical ? 0.55 : hasWarning ? 0.40 : 0.25,
      }).addTo(heatLayerRef.current!);
    });
  }, [sensors, showHeatmap, mapReady]);

  // ── Fly to selected sensor (only when selectedId actually changes) ─────────
  useEffect(() => {
    if (!mapRef.current || !mapReady || !selectedId) return;
    if (prevSelectedRef.current === selectedId) return;
    prevSelectedRef.current = selectedId;

    const sensor = sensors.find(s => s.id === selectedId);
    if (!sensor) return;

    mapRef.current.flyTo([sensor.latitude, sensor.longitude], 15, {
      duration: 0.85,
      easeLinearity: 0.25,
    });

    // Open popup after fly animation settles
    setTimeout(() => {
      markersRef.current.get(sensor.id)?.openPopup();
    }, 920);
  }, [selectedId, mapReady]);
  // NOTE: `sensors` intentionally omitted from deps — we don't want to re-fly
  // every time sensor statuses update during polling.

  return (
    <div
      ref={containerRef}
      className={`w-full h-[560px] ${mapReady ? 'map-ready' : ''}`}
      style={{ minHeight: 560, background: '#0a0d1f' }}
    />
  );
}
