import { divIcon, DragEndEvent } from 'leaflet';
import { useEffect, useMemo } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  PLACE_ZOOM,
  WORLD_CENTER,
  WORLD_ZOOM,
} from '../../constants/structureLocation';
import { TLatLng } from '../../types/structureLocation';
import 'leaflet/dist/leaflet.css';

const PIN_ICON = divIcon({
  className: '',
  html: '<span class="block size-5 rounded-full border-2 border-white bg-primary shadow-md"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
const CIRCLE_STYLE = {
  className: 'stroke-primary fill-primary/20',
  weight: 1.5,
  fillOpacity: 1,
};

type TStructureLocationMapProps = {
  position: TLatLng | null;
  radius: number;
  fallbackCenter: TLatLng | null;
  onChange: (place: TLatLng) => void;
};

type TStructureLocationMapEventsProps = {
  position: TLatLng | null;
  onPick: (place: TLatLng) => void;
};

const StructureLocationMapEvents = ({
  position,
  onPick,
}: TStructureLocationMapEventsProps) => {
  const map = useMapEvents({ click: (event) => onPick(event.latlng) });

  useEffect(() => {
    if (position && !map.getBounds().contains(position)) {
      map.flyTo(position, Math.max(map.getZoom(), PLACE_ZOOM));
    }
  }, [position, map]);

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());

    return () => observer.disconnect();
  }, [map]);

  return null;
};

export const StructureLocationMap = ({
  position,
  radius,
  fallbackCenter,
  onChange,
}: TStructureLocationMapProps) => {
  const center = position ?? fallbackCenter;
  const markerHandlers = useMemo(
    () => ({
      dragend: (event: DragEndEvent) => onChange(event.target.getLatLng()),
    }),
    [onChange],
  );

  return (
    <MapContainer
      center={center ?? WORLD_CENTER}
      zoom={center ? PLACE_ZOOM : WORLD_ZOOM}
      scrollWheelZoom={false}
      className="isolate h-56 w-full rounded-lg border dark:[&_.leaflet-tile-pane]:hue-rotate-180 dark:[&_.leaflet-tile-pane]:invert"
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <StructureLocationMapEvents position={position} onPick={onChange} />
      {position && (
        <>
          <Marker
            position={position}
            icon={PIN_ICON}
            draggable
            eventHandlers={markerHandlers}
          />
          {radius > 0 && (
            <Circle
              center={position}
              radius={radius}
              pathOptions={CIRCLE_STYLE}
            />
          )}
        </>
      )}
    </MapContainer>
  );
};
