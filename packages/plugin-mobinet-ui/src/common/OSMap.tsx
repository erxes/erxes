import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  onChangeCenter?: (position: any) => void;

  // onDragEndCenter?: (e: any) => void;
};

const Map = (props: Props) => {
  console.log('Map props = ', props.center);
  const { id, zoom, width = '100%', height = '100%', center } = props;

  const [markers, setMarkers] = React.useState<any[]>(props.markers || []);

  if (
    props.addMarkerOnCenter &&
    markers.findIndex(item => item.id === 'center') === -1
  ) {
    console.log('push center');
    markers.push({
      position: center,
      draggable: true,
      id: 'center',
      name: 'You are here'
    });
  }

  const eventHandlers = {
    dragend: e => {
      console.log('dragend = ', e.target.getLatLng());

      const { lat, lng } = e.target.getLatLng();

      if (props.onChangeCenter) {
        console.log('onChangeCenter', e.target.title);
        props.onChangeCenter({ lat, lng });
      }
      // console.log('markers = ', e.target );
    }
  };

  console.log('markers.length', markers.length);

  return (
    <MapContainer
      center={center || [47.919481, 106.904299]}
      zoom={zoom || 10}
      zoomControl={true}
      style={{ height, width }}
      id={id}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          draggable={marker.draggable}
          eventHandlers={eventHandlers}
          title={marker.id}
        >
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default Map;
