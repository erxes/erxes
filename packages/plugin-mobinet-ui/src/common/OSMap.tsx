import 'leaflet/dist/leaflet.css';

import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  Polygon,
} from 'react-leaflet';

import Leaflet from 'leaflet';
import { ICoordinates } from '../types';
import { IBuilding } from '../modules/buildings/types';

type Props = {
  id: string;
  width?: string;
  height?: string;
  zoom?: number;
  markers?: any[];
  addMarkerOnCenter?: boolean;
  center?: {
    lat: number;
    lng: number;
  };
  buildings: IBuilding[];
  onChangeZoom?: (zoomLevel: number) => void;
  onChangeCenter?: (center: ICoordinates, bounds: ICoordinates[]) => void;
  // onChange: (data: any) => void;
  onload?: (bounds: ICoordinates[], mapRef: any) => void;
};
let timer;
const MapComponent = (props: Props) => {
  const map = useMap();

  const mapEvents = useMapEvents({
    zoomend: () => {
      props.onChangeZoom && props.onChangeZoom(mapEvents.getZoom());
    },
    dragend: () => {
      {
        console.log('this called');
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          const bounds: ICoordinates[] = [];
          bounds.push({
            lat: map.getBounds().getNorthEast().lat,
            lng: map.getBounds().getNorthEast().lng,
          });
          bounds.push({
            lat: map.getBounds().getSouthWest().lat,
            lng: map.getBounds().getSouthWest().lng,
          });
          bounds.push({
            lat: map.getBounds().getNorthWest().lat,
            lng: map.getBounds().getNorthWest().lng,
          });
          bounds.push({
            lat: map.getBounds().getNorthEast().lat,
            lng: map.getBounds().getNorthEast().lng,
          });

          props.onChangeCenter && props.onChangeCenter(map.getCenter(), bounds);
          return;
        }, 1000);

        return () => {
          clearTimeout(timer);
        };
      }
    },
  });

  map.setView(props.center || [47.919481, 106.904299], props.zoom || 5);

  return null;
};

const Map = (props: Props) => {
  const { id, zoom, width = '100%', height = '100%' } = props;

  const [markers, setMarkers] = React.useState<any[]>(props.markers || []);
  const [center, setCenter] = useState(props.center || { lat: 0, lng: 0 });
  const [dd, setDD] = useState<IBuilding[]>();
  if (
    props.addMarkerOnCenter &&
    markers.findIndex((item) => item.id === 'center') === -1
  ) {
    markers.push({
      position: center,
      draggable: true,
      id: 'center',
      name: 'You are here',
    });
  }

  useEffect(() => {
    setCenter(props.center || { lat: 0, lng: 0 });

    if (props.addMarkerOnCenter) {
      const centerMarkerIndex = markers.findIndex(
        (item) => item.id === 'center',
      );

      if (centerMarkerIndex !== -1) {
        markers[centerMarkerIndex].position = center;
        setMarkers([...markers]);
      }
    }
  }, [props.id, center, zoom, setCenter]);
  useEffect(() => {
    const filter = props.buildings?.filter((d) => d.drawnPoints) || [];
    console.log(filter);
    setDD(filter);
  }, [props.buildings]);
  const eventHandlers = {
    // dragend: e => {
    //   const { lat, lng } = e.target.getLatLng();
    //   if (props.onChangeCenter) {
    //     props.onChangeCenter({ lat, lng }, []);
    //   }
    // }
  };

  const markerHtmlStyles = `
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #ff0000;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -20px 0 0 -20px;`;

  const icon = Leaflet.divIcon({
    className: 'my-custom-pin',
    iconAnchor: [0, 24],
    popupAnchor: [0, -36],
    html: `<div style="${markerHtmlStyles}" />`,
  });

  return (
    <MapContainer
      center={center || [47.919481, 106.904299]}
      zoom={zoom || 10}
      zoomControl={true}
      style={{ height, width, zIndex: 0 }}
      id={id}
    >
      <MapComponent {...props} />

      {markers.map((marker, index) => (
        <Marker
          icon={icon}
          key={index}
          position={marker.position}
          draggable={marker.draggable}
          eventHandlers={eventHandlers}
          title={marker.id}
        >
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
      {dd?.map((d) => (
        <Polygon
          pathOptions={{ color: 'lime' }}
          positions={d.drawnPoints.map((x) => [x.lat, x.lng])}
        />
      ))}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default Map;
