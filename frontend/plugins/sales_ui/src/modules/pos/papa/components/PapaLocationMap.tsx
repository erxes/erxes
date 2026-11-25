import { cn } from 'erxes-ui';
import { divIcon, DragEndEvent, LatLngLiteral } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Papa delivers in Ulaanbaatar first; the map opens there until a pin exists.
const ULAANBAATAR: LatLngLiteral = { lat: 47.9185, lng: 106.9176 };
const CITY_ZOOM = 12;
const PLACE_ZOOM = 16;

// A div icon sidesteps Leaflet's default marker images, which bundlers can't resolve.
const PIN_ICON = divIcon({
  className: '',
  html: '<span class="block size-5 rounded-full border-2 border-white bg-primary shadow-md"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const PapaLocationMapEvents = ({
  position,
  onPick,
}: {
  position: LatLngLiteral | null;
  onPick: (place: LatLngLiteral) => void;
}) => {
  const map = useMapEvents({ click: (event) => onPick(event.latlng) });

  // A typed or searched position can land off-screen; clicks and drags never do.
  useEffect(() => {
    if (position && !map.getBounds().contains(position)) {
      map.flyTo(position, Math.max(map.getZoom(), PLACE_ZOOM));
    }
  }, [position, map]);

  // The side panel animates open, so Leaflet first measures a zero-size box.
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());

    return () => observer.disconnect();
  }, [map]);

  return null;
};

interface PapaLocationMapProps {
  position: LatLngLiteral | null;
  onChange: (place: LatLngLiteral) => void;
  className?: string;
}

/** Click or drag to set the delivery point Papa prices and routes to. */
export const PapaLocationMap = ({
  position,
  onChange,
  className,
}: PapaLocationMapProps) => {
  const markerHandlers = useMemo(
    () => ({
      dragend: (event: DragEndEvent) => onChange(event.target.getLatLng()),
    }),
    [onChange],
  );

  return (
    <MapContainer
      center={position ?? ULAANBAATAR}
      zoom={position ? PLACE_ZOOM : CITY_ZOOM}
      // The panel scrolls; the wheel should scroll it, not zoom the map.
      scrollWheelZoom={false}
      className={cn(
        'isolate h-56 w-full rounded-lg border dark:[&_.leaflet-tile-pane]:hue-rotate-180 dark:[&_.leaflet-tile-pane]:invert',
        className,
      )}
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <PapaLocationMapEvents position={position} onPick={onChange} />
      {position && (
        <Marker
          position={position}
          icon={PIN_ICON}
          draggable
          eventHandlers={markerHandlers}
        />
      )}
    </MapContainer>
  );
};
