import { MapContainer } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import GoogleMap from './GoogleMap';
import { ILocationOption } from '../../types';
import Marker from './Marker';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  googleMapApiKey: string;
  center?: ILocationOption;
  locationOptions: ILocationOption[];
  locale?: string;
};

const loadMapScript = (apiKey: string, locale?: string) => {
  if (!apiKey) {
    return '';
  }

  const mapsURL = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&language=${locale ||
    'en'}&v=quarterly`;
  const scripts: any = document.getElementsByTagName('script');
  // Go through existing script tags, and return google maps api tag when found.
  for (const script of scripts) {
    if (script.src.indexOf(mapsURL) === 0) {
      return script;
    }
  }

  const googleMapScript = document.createElement('script');
  googleMapScript.src = mapsURL;
  googleMapScript.async = true;
  googleMapScript.defer = true;
  window.document.body.appendChild(googleMapScript);

  return googleMapScript;
};

const Map = (props: Props) => {
  const { locationOptions } = props;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [center, setCenter] = useState(props.center || { lat: 0, lng: 0 });
  const [selectedOption, setSelectedOption] = useState<
    ILocationOption | undefined
  >(undefined);

  const mapScript = loadMapScript(
    props.googleMapApiKey || 'demo',
    props.locale
  );

  mapScript.addEventListener('load', () => {
    setMapLoaded(true);

    if (locationOptions && locationOptions.length) {
      const bounds = new google.maps.LatLngBounds();
      for (let marker of locationOptions) {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      }

      const map = new google.maps.Map(document.getElementById('map'));
      console.log('MAP = ', map);

      // map.fitBounds(bounds);
    }
  });

  const onLocationChange = (option: ILocationOption) => {
    if (locationOptions.length > 0) {
      return setSelectedOption(option);
    }

    setCenter(option);
  };

  const renderContent = () => {
    if (!mapLoaded) {
      return null;
    }

    return (
      <MapContainer>
        <GoogleMap
          center={new google.maps.LatLng(center.lat, center.lng)}
          controlSize={25}
          streetViewControl={false}
          zoom={4}
          style={{ width: '100%', height: '250px' }}
        >
          {locationOptions.length > 0 ? (
            locationOptions.map((option, index) => (
              <Marker
                color={
                  selectedOption &&
                  option.lat === selectedOption.lat &&
                  option.lng === selectedOption.lng
                    ? 'red'
                    : ''
                }
                key={index}
                position={new google.maps.LatLng(option.lat, option.lng)}
                content={option.description}
                draggable={false}
                onChange={onLocationChange}
              />
            ))
          ) : (
            <Marker
              color={''}
              position={new google.maps.LatLng(center.lat, center.lng)}
              content={__('Select your location')}
              draggable={true}
              onChange={onLocationChange}
            />
          )}
        </GoogleMap>
      </MapContainer>
    );
  };

  return renderContent();
};

export default Map;
