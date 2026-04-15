'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLngTuple = [number, number];

// Fix Leaflet default icon issue with bundlers (Next.js/Webpack)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type MarkerIconColor =
  | 'blue'
  | 'red'
  | 'green'
  | 'orange'
  | 'yellow'
  | 'violet'
  | 'grey'
  | 'black';

type MarkerIconSize = 'small' | 'medium' | 'large';

export interface AdvancedMapMarker {
  id?: string | number;
  position: LatLngTuple;
  color?: MarkerIconColor;
  size?: MarkerIconSize;
  icon?: L.Icon;
  iconHtml?: string;
  iconSizePx?: number;
  popup?: {
    title: string;
    content: string;
    image?: string;
  };
  raw?: unknown;
}

export interface AdvancedMapPolygon {
  id?: string | number;
  positions: LatLngTuple[];
  style?: L.PathOptions;
  popup?: string;
}

export interface AdvancedMapCircle {
  id?: string | number;
  center: LatLngTuple;
  radius: number;
  style?: L.PathOptions;
  popup?: string;
}

export interface AdvancedMapPolyline {
  id?: string | number;
  positions: LatLngTuple[];
  style?: L.PathOptions;
  popup?: string;
}

export interface AdvancedMapLayers {
  openstreetmap: boolean;
  satellite: boolean;
  traffic: boolean;
}

export interface AdvancedMapProps {
  center?: LatLngTuple;
  zoom?: number;
  markers?: AdvancedMapMarker[];
  polygons?: AdvancedMapPolygon[];
  circles?: AdvancedMapCircle[];
  polylines?: AdvancedMapPolyline[];
  onMarkerClick?: (marker: AdvancedMapMarker) => void;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  enableDrawing?: boolean;
  mapLayers?: AdvancedMapLayers;
  className?: string;
  style?: React.CSSProperties;
}

const createCustomIcon = (color: MarkerIconColor = 'blue', size: MarkerIconSize = 'medium') => {
  const sizes: Record<MarkerIconSize, [number, number]> = {
    small: [20, 32],
    medium: [25, 41],
    large: [30, 50],
  };

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: sizes[size],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function MapEvents({
  onMapClick,
  onLocationFound,
}: {
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onLocationFound?: (latlng: { lat: number; lng: number }) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng);
    },
    locationfound: (e) => {
      onLocationFound?.(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
}

function CustomControls({
  onLocate,
  onToggleLayer,
}: {
  onLocate: () => void;
  onToggleLayer: (layerType: keyof AdvancedMapLayers) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'topright' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'custom-controls');
      div.innerHTML = `
        <div style="background: rgba(0,0,0,0.72); color: rgba(255,255,255,0.75); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 40px rgba(0,0,0,0.5); backdrop-filter: blur(12px); display:flex; flex-direction:column; gap:6px;">
          <button id="locate-btn" style="padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); font-weight:600;">📍 Locate</button>
          <button id="satellite-btn" style="padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); font-weight:600;">🛰 Satellite</button>
          <button id="traffic-btn" style="padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); font-weight:600;">🚦 Traffic</button>
        </div>
      `;

      L.DomEvent.disableClickPropagation(div);

      const locateBtn = div.querySelector<HTMLButtonElement>('#locate-btn');
      const satelliteBtn = div.querySelector<HTMLButtonElement>('#satellite-btn');
      const trafficBtn = div.querySelector<HTMLButtonElement>('#traffic-btn');

      if (locateBtn) locateBtn.onclick = () => onLocate();
      if (satelliteBtn) satelliteBtn.onclick = () => onToggleLayer('satellite');
      if (trafficBtn) trafficBtn.onclick = () => onToggleLayer('traffic');

      return div;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, onLocate, onToggleLayer]);

  return null;
}

function SearchControl({ onSearch }: { onSearch?: (result: { latLng: LatLngTuple; name: string }) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      );
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latLng: LatLngTuple = [parseFloat(lat), parseFloat(lon)];
        map.flyTo(latLng, 13);
        onSearch?.({ latLng, name: display_name });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [map, onSearch, query]);

  useEffect(() => {
    const control = L.control({ position: 'topleft' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'search-control');
      div.innerHTML = `
        <div style="background: rgba(0,0,0,0.72); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 40px rgba(0,0,0,0.5); backdrop-filter: blur(12px); display:flex; gap:8px; align-items:center;">
          <input
            id="search-input"
            type="text"
            placeholder="Search places…"
            style="padding: 8px 10px; border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; width: 220px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); outline: none;"
          />
          <button
            id="search-btn"
            style="padding: 8px 12px; border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; cursor: pointer; background: rgba(16,185,129,0.18); color: rgba(255,255,255,0.9); font-weight:700;"
          >
            🔍
          </button>
        </div>
      `;

      L.DomEvent.disableClickPropagation(div);

      const input = div.querySelector<HTMLInputElement>('#search-input');
      const button = div.querySelector<HTMLButtonElement>('#search-btn');

      input?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        setQuery(target.value);
      });
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') void handleSearch();
      });
      button?.addEventListener('click', () => void handleSearch());

      return div;
    };

    control.addTo(map);
    return () => control.remove();
  }, [handleSearch, map]);

  return null;
}

export function AdvancedMap({
  center = [28.6139, 77.2090],
  zoom = 11,
  markers = [],
  polygons = [],
  circles = [],
  polylines = [],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  enableDrawing = false,
  mapLayers = {
    openstreetmap: true,
    satellite: false,
    traffic: false,
  },
  className = '',
  style = { height: '560px', width: '100%' },
}: AdvancedMapProps) {
  const [currentLayers, setCurrentLayers] = useState<AdvancedMapLayers>(mapLayers);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [searchResult, setSearchResult] = useState<{ latLng: LatLngTuple; name: string } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleToggleLayer = useCallback((layerType: keyof AdvancedMapLayers) => {
    setCurrentLayers((prev) => ({ ...prev, [layerType]: !prev[layerType] }));
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    // Geolocation may be blocked by browser settings/extensions or insecure contexts.
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      console.warn('[AdvancedMap] Geolocation requires a secure context (https/localhost).');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        // Avoid throwing noisy overlays; just log a compact warning.
        const code = (error as GeolocationPositionError | undefined)?.code;
        if (code === 1) {
          console.warn('[AdvancedMap] Geolocation permission denied.');
        } else if (code === 2) {
          console.warn('[AdvancedMap] Geolocation position unavailable.');
        } else if (code === 3) {
          console.warn('[AdvancedMap] Geolocation request timed out.');
        } else {
          console.warn('[AdvancedMap] Geolocation error.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const handleMapClick = useCallback(
    (latlng: { lat: number; lng: number }) => {
      setClickedLocation(latlng);
      onMapClick?.(latlng);
    },
    [onMapClick],
  );

  const handleSearch = useCallback((result: { latLng: LatLngTuple; name: string }) => {
    setSearchResult(result);
  }, []);

  const renderedMarkers = useMemo(
    () =>
      markers.map((marker, index) => (
        <Marker
          key={marker.id ?? index}
          position={marker.position}
          icon={
            marker.icon ??
            (marker.iconHtml
              ? L.divIcon({
                  className: 'custom-sensor-marker',
                  iconSize: [marker.iconSizePx ?? 26, marker.iconSizePx ?? 26],
                  iconAnchor: [
                    (marker.iconSizePx ?? 26) / 2,
                    (marker.iconSizePx ?? 26) / 2,
                  ],
                  popupAnchor: [0, -((marker.iconSizePx ?? 26) / 2) - 6],
                  html: marker.iconHtml,
                })
              : createCustomIcon(marker.color ?? 'blue', marker.size ?? 'medium'))
          }
          eventHandlers={{
            click: () => onMarkerClick?.(marker),
          }}
        >
          {marker.popup && (
            <Popup>
              <div className="space-y-2">
                <div className="font-bold">{marker.popup.title}</div>
                <div className="text-sm opacity-80">{marker.popup.content}</div>
                {marker.popup.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={marker.popup.image}
                    alt={marker.popup.title}
                    style={{ maxWidth: '200px', height: 'auto', borderRadius: 10 }}
                  />
                )}
              </div>
            </Popup>
          )}
        </Marker>
      )),
    [markers, onMarkerClick],
  );

  return (
    <div className={className} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        {currentLayers.openstreetmap && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            crossOrigin="anonymous"
          />
        )}

        {currentLayers.satellite && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            crossOrigin="anonymous"
          />
        )}

        {/* Traffic is a placeholder toggle; wire a real provider if you have one */}

        <MapEvents onMapClick={handleMapClick} onLocationFound={setUserLocation} />
        {enableSearch && <SearchControl onSearch={handleSearch} />}
        {enableControls && (
          <CustomControls onLocate={handleLocate} onToggleLayer={handleToggleLayer} />
        )}

        {enableClustering ? <MarkerClusterGroup>{renderedMarkers}</MarkerClusterGroup> : renderedMarkers}

        {userLocation && (
          <Marker position={userLocation} icon={createCustomIcon('red', 'medium')}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {searchResult && (
          <Marker position={searchResult.latLng} icon={createCustomIcon('green', 'large')}>
            <Popup>{searchResult.name}</Popup>
          </Marker>
        )}

        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={createCustomIcon('orange', 'small')}
          >
            <Popup>
              Lat: {clickedLocation.lat.toFixed(6)}
              <br />
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {polygons.map((polygon, index) => (
          <Polygon
            key={polygon.id ?? index}
            positions={polygon.positions}
            pathOptions={polygon.style ?? { color: 'purple', weight: 2, fillOpacity: 0.3 }}
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {circles.map((circle, index) => (
          <Circle
            key={circle.id ?? index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={circle.style ?? { color: 'blue', weight: 2, fillOpacity: 0.2 }}
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {polylines.map((polyline, index) => (
          <Polyline
            key={polyline.id ?? index}
            positions={polyline.positions}
            pathOptions={polyline.style ?? { color: 'red', weight: 3 }}
          >
            {polyline.popup && <Popup>{polyline.popup}</Popup>}
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}

