import { MapContainer } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import GoogleMap from './GoogleMap';
import { ILocationOption } from '../../types';
import Marker from './Marker';
import { __ } from '@erxes/ui/src/utils/core';

// type Props = {
//   googleMapApiKey: string;
//   center?: ILocationOption;
//   locationOptions: ILocationOption[];
//   locale?: string;
// };

interface IMapProps extends google.maps.MapOptions {
  id: string;
  googleMapApiKey: string;
  center?: ILocationOption;
  locationOptions: ILocationOption[];
  locale?: string;
}

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

const Map = (props: IMapProps) => {
  const { locationOptions, ...options } = props;
  // const [mapLoaded, setMapLoaded] = useState(false);
  // const [center, setCenter] = useState(props.center || { lat: 0, lng: 0 });
  // const [selectedOption, setSelectedOption] = useState<
  //   ILocationOption | undefined
  // >(undefined);

  const mapScript = loadMapScript(
    props.googleMapApiKey || 'demo',
    props.locale
  );

  mapScript.addEventListener('load', () => {
    renderMap();
  });

  const onLocationChange = (option: ILocationOption) => {
    if (locationOptions.length > 0) {
      // return setSelectedOption(option);
    }

    console.log(option);

    // setCenter(option);
  };

  const renderMap = () => {
    console.log('MAP rendering');
    const map = new google.maps.Map(document.getElementById(props.id), {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      ...options
    });
    // setMapLoaded(true);

    const bounds = new google.maps.LatLngBounds();

    if (locationOptions.length > 0) {
      locationOptions.forEach(option => {
        new google.maps.Marker({
          position: {
            lat: option.lat,
            lng: option.lng
          },
          map,
          title: option.description
        });

        bounds.extend(new google.maps.LatLng(option.lat, option.lng));
      });
      return map.fitBounds(bounds);
    }

    if (props.center && locationOptions.length === 0) {
      new google.maps.Marker({
        position: {
          lat: props.center.lat,
          lng: props.center.lng
        },
        map,
        title: 'your location'
      });
    }
  };

  return <MapContainer id={props.id} />;
};

export default Map;
