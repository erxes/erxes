import { MapContainer } from '@erxes/ui/src/styles/main';
import React, { useEffect, useState } from 'react';
import { ILocationOption } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';
import colors from '../../styles/colors';
import {} from './mapTypes';
import { ITrackingData } from '../../../../plugin-tumentech-ui/src/types';

export interface IMapProps extends google.maps.MapOptions {
  id: string;
  googleMapApiKey?: string;
  center?: ILocationOption;
  locationOptions: ILocationOption[];
  locale?: string;
  connectWithLines?: boolean;
  googleMapPath?: string | string[];
  mode?: 'view' | 'config';
  fullHeight?: boolean;
  trackingData?: ITrackingData[];
  startPoints?: ILocationOption[];
  endPoints?: ILocationOption[];
  onChangeMarker?: (location: ILocationOption) => void;
  onChangeLocationOptions?: (locationOptions: ILocationOption[]) => void;
}

interface IMarker extends google.maps.Marker {
  tag: string;
}

const MAP_MARKERS = {
  default:
    'M32 62c0-17.1 16.3-25.2 17.8-39.7A18 18 0 1 0 14 20a18.1 18.1 0 0 0 .2 2.2C15.7 36.8 32 44.9 32 62z',
  truck:
    'M 38.136719 5.386719 L 19.902344 5.386719 C 18.875 5.386719 18.039062 6.222656 18.039062 7.246094 L 18.039062 11.117188 L 12.585938 11.117188 C 11.664062 11.117188 10.488281 11.6875 9.917969 12.414062 L 6.265625 17.050781 C 5.789062 17.652344 4.796875 18.4375 4.097656 18.761719 L 1.542969 19.945312 C 0.675781 20.34375 0 21.40625 0 22.359375 L 0 29.140625 C 0 30.140625 0.8125 30.957031 1.816406 30.957031 L 2.625 30.957031 C 3.238281 33.066406 5.1875 34.613281 7.496094 34.613281 C 9.804688 34.613281 11.753906 33.066406 12.367188 30.957031 L 24.765625 30.957031 C 25.382812 33.066406 27.332031 34.613281 29.640625 34.613281 C 31.945312 34.613281 33.898438 33.066406 34.511719 30.957031 L 38.183594 30.957031 C 39.183594 30.957031 40 30.140625 40 29.140625 L 40 7.246094 C 40 6.222656 39.164062 5.386719 38.136719 5.386719 Z M 7.496094 32.058594 C 6.105469 32.058594 4.976562 30.929688 4.976562 29.539062 C 4.976562 28.144531 6.105469 27.015625 7.496094 27.015625 C 8.886719 27.015625 10.015625 28.144531 10.015625 29.539062 C 10.015625 30.929688 8.886719 32.058594 7.496094 32.058594 Z M 17.976562 18.242188 C 17.976562 18.90625 17.433594 19.441406 16.769531 19.433594 L 9.164062 19.332031 C 8.5 19.320312 8.289062 18.886719 8.695312 18.359375 L 11.691406 14.484375 C 12.097656 13.960938 12.972656 13.53125 13.636719 13.53125 L 16.769531 13.53125 C 17.433594 13.53125 17.976562 14.074219 17.976562 14.734375 Z M 29.640625 32.058594 C 28.246094 32.058594 27.117188 30.929688 27.117188 29.539062 C 27.117188 28.144531 28.246094 27.015625 29.640625 27.015625 C 31.03125 27.015625 32.160156 28.144531 32.160156 29.539062 C 32.160156 30.929688 31.03125 32.058594 29.640625 32.058594 Z M 29.640625 32.058594 ',
  load:
    'M 320.859375 153.71875 C 300.699219 153.71875 284.460938 170.105469 284.460938 190.191406 C 284.460938 210.386719 300.808594 226.660156 320.859375 226.660156 C 341.003906 226.660156 357.238281 210.273438 357.238281 190.191406 C 357.238281 169.992188 340.890625 153.71875 320.859375 153.71875 Z M 81.269531 0.109375 L 138.414062 0.109375 C 141.414062 0.109375 143.871094 2.566406 143.871094 5.582031 L 143.871094 51.394531 C 143.871094 54.398438 141.414062 56.855469 138.414062 56.855469 L 81.269531 56.855469 C 78.269531 56.855469 75.816406 54.398438 75.816406 51.394531 L 75.816406 5.582031 C 75.816406 2.566406 78.269531 0.109375 81.269531 0.109375 Z M 58.042969 86.238281 C 59.84375 86.3125 61.125 86.90625 61.851562 88.035156 C 63.855469 91.035156 61.125 94.003906 59.226562 96.101562 C 53.859375 102 40.6875 116.214844 38.03125 119.339844 C 36.023438 121.566406 33.164062 121.566406 31.15625 119.339844 C 28.417969 116.132812 14.578125 101.277344 9.472656 95.527344 C 7.703125 93.53125 5.511719 90.800781 7.359375 88.035156 C 8.109375 86.90625 9.367188 86.3125 11.167969 86.238281 L 21.710938 86.238281 L 21.710938 72.078125 C 21.710938 69.101562 24.140625 66.667969 27.113281 66.667969 L 42.097656 66.667969 C 45.066406 66.667969 47.496094 69.101562 47.496094 72.078125 L 47.496094 86.238281 Z M 58.042969 20.671875 C 59.84375 20.757812 61.125 21.34375 61.851562 22.46875 C 63.855469 25.476562 61.125 28.445312 59.226562 30.535156 C 53.859375 36.441406 40.6875 50.65625 38.03125 53.78125 C 36.023438 56.007812 33.164062 56.007812 31.15625 53.78125 C 28.417969 50.574219 14.578125 35.722656 9.472656 29.972656 C 7.703125 27.972656 5.511719 25.242188 7.359375 22.46875 C 8.109375 21.34375 9.367188 20.757812 11.167969 20.671875 L 21.710938 20.671875 L 21.710938 6.511719 C 21.710938 3.542969 24.140625 1.109375 27.113281 1.109375 L 42.097656 1.109375 C 45.066406 1.109375 47.496094 3.550781 47.496094 6.511719 L 47.496094 20.671875 Z M 162.585938 65.261719 L 219.726562 65.261719 C 222.726562 65.261719 225.1875 67.71875 225.1875 70.734375 L 225.1875 116.542969 C 225.1875 119.550781 222.726562 122.007812 219.726562 122.007812 L 162.585938 122.007812 C 159.585938 122.007812 157.132812 119.550781 157.132812 116.542969 L 157.132812 70.734375 C 157.132812 67.71875 159.585938 65.261719 162.585938 65.261719 Z M 182.199219 71.476562 L 200.113281 71.476562 L 200.113281 90.457031 L 191.242188 82.945312 L 182.199219 90.457031 Z M 162.585938 0.109375 L 219.726562 0.109375 C 222.726562 0.109375 225.1875 2.566406 225.1875 5.582031 L 225.1875 51.394531 C 225.1875 54.398438 222.726562 56.855469 219.726562 56.855469 L 162.585938 56.855469 C 159.585938 56.855469 157.132812 54.398438 157.132812 51.394531 L 157.132812 5.582031 C 157.132812 2.566406 159.585938 0.109375 162.585938 0.109375 Z M 182.199219 6.316406 L 200.113281 6.316406 L 200.113281 25.296875 L 191.242188 17.789062 L 182.199219 25.296875 Z M 81.269531 65.261719 L 138.414062 65.261719 C 141.414062 65.261719 143.871094 67.71875 143.871094 70.734375 L 143.871094 116.542969 C 143.871094 119.550781 141.414062 122.007812 138.414062 122.007812 L 81.269531 122.007812 C 78.269531 122.007812 75.816406 119.550781 75.816406 116.542969 L 75.816406 70.734375 C 75.816406 67.71875 78.269531 65.261719 81.269531 65.261719 Z M 100.875 71.476562 L 118.800781 71.476562 L 118.800781 90.457031 L 109.925781 82.945312 L 100.875 90.457031 Z M 100.875 6.316406 L 118.800781 6.316406 L 118.800781 25.296875 L 109.925781 17.789062 L 100.875 25.296875 Z M 112.335938 156.960938 C 92.175781 156.960938 75.945312 173.34375 75.945312 193.421875 C 75.945312 213.625 92.296875 229.890625 112.335938 229.890625 C 132.488281 229.890625 148.726562 213.511719 148.726562 193.421875 C 148.726562 173.234375 132.375 156.960938 112.335938 156.960938 Z M 112.335938 179.394531 C 104.609375 179.394531 98.339844 185.679688 98.339844 193.421875 C 98.339844 201.171875 104.609375 207.445312 112.335938 207.445312 C 120.058594 207.445312 126.328125 201.171875 126.328125 193.421875 C 126.328125 185.679688 120.058594 179.394531 112.335938 179.394531 Z M 237.441406 134.082031 L 0 134.082031 L 0 171.648438 C 0 180.726562 7.417969 188.167969 16.492188 188.167969 L 64.265625 188.167969 C 65.484375 176.960938 70.550781 166.859375 78.128906 159.238281 L 78.148438 159.207031 L 78.203125 159.164062 C 86.953125 150.40625 99.023438 144.972656 112.335938 144.972656 C 125.664062 144.972656 137.765625 150.398438 146.527344 159.167969 C 154.101562 166.769531 159.179688 176.878906 160.394531 188.167969 L 275.398438 188.167969 C 277.859375 132.066406 358.132812 124.324219 366.308594 188.167969 L 384 188.167969 C 373.808594 117.09375 384.015625 132.816406 319.777344 107.496094 C 319.230469 99.300781 317.039062 91.070312 314.109375 82.976562 C 301.402344 47.875 280.335938 50.925781 237.441406 50.625 Z M 279.324219 69.800781 L 258.742188 69.46875 L 258.742188 107.496094 L 296.84375 107.496094 C 294.945312 95.09375 290.023438 80.445312 279.324219 69.800781 Z M 320.859375 176.164062 C 313.125 176.164062 306.863281 182.449219 306.863281 190.191406 C 306.863281 197.929688 313.125 204.214844 320.859375 204.214844 C 328.574219 204.214844 334.84375 197.929688 334.84375 190.191406 C 334.84375 182.449219 328.574219 176.164062 320.859375 176.164062 Z M 320.859375 176.164062',
  unload:
    'M 320.859375 153.71875 C 300.699219 153.71875 284.460938 170.105469 284.460938 190.191406 C 284.460938 210.386719 300.808594 226.660156 320.859375 226.660156 C 341.003906 226.660156 357.238281 210.273438 357.238281 190.191406 C 357.238281 169.992188 340.890625 153.71875 320.859375 153.71875 Z M 51.390625 35.878906 C 53.191406 35.804688 54.464844 35.210938 55.199219 34.082031 C 57.203125 31.082031 54.472656 28.113281 52.574219 26.019531 C 47.203125 20.117188 34.027344 5.902344 31.378906 2.777344 C 29.371094 0.550781 26.503906 0.550781 24.503906 2.777344 C 21.757812 5.988281 7.925781 20.839844 2.8125 26.589844 C 1.042969 28.589844 -1.148438 31.316406 0.699219 34.082031 C 1.449219 35.210938 2.714844 35.804688 4.515625 35.878906 L 15.058594 35.878906 L 15.058594 50.039062 C 15.058594 53.015625 17.484375 55.453125 20.453125 55.453125 L 35.445312 55.453125 C 38.414062 55.453125 40.84375 53.015625 40.84375 50.039062 L 40.84375 35.878906 Z M 51.390625 101.445312 C 53.191406 101.363281 54.464844 100.769531 55.199219 99.648438 C 57.203125 96.640625 54.472656 93.671875 52.574219 91.582031 C 47.203125 85.675781 34.027344 71.460938 31.378906 68.335938 C 29.371094 66.109375 26.503906 66.109375 24.503906 68.335938 C 21.757812 71.542969 7.925781 86.398438 2.8125 92.148438 C 1.042969 94.144531 -1.148438 96.875 0.699219 99.648438 C 1.449219 100.769531 2.714844 101.363281 4.515625 101.445312 L 15.058594 101.445312 L 15.058594 115.605469 C 15.058594 118.574219 17.484375 121.007812 20.453125 121.007812 L 35.445312 121.007812 C 38.414062 121.007812 40.84375 118.566406 40.84375 115.605469 L 40.84375 101.445312 Z M 81.269531 0.109375 L 138.414062 0.109375 C 141.414062 0.109375 143.871094 2.566406 143.871094 5.582031 L 143.871094 51.394531 C 143.871094 54.398438 141.414062 56.855469 138.414062 56.855469 L 81.269531 56.855469 C 78.269531 56.855469 75.816406 54.398438 75.816406 51.394531 L 75.816406 5.582031 C 75.816406 2.566406 78.269531 0.109375 81.269531 0.109375 Z M 162.585938 65.261719 L 219.726562 65.261719 C 222.726562 65.261719 225.1875 67.71875 225.1875 70.734375 L 225.1875 116.542969 C 225.1875 119.550781 222.726562 122.007812 219.726562 122.007812 L 162.585938 122.007812 C 159.585938 122.007812 157.132812 119.550781 157.132812 116.542969 L 157.132812 70.734375 C 157.132812 67.71875 159.585938 65.261719 162.585938 65.261719 Z M 182.199219 71.476562 L 200.113281 71.476562 L 200.113281 90.457031 L 191.242188 82.945312 L 182.199219 90.457031 Z M 162.585938 0.109375 L 219.726562 0.109375 C 222.726562 0.109375 225.1875 2.566406 225.1875 5.582031 L 225.1875 51.394531 C 225.1875 54.398438 222.726562 56.855469 219.726562 56.855469 L 162.585938 56.855469 C 159.585938 56.855469 157.132812 54.398438 157.132812 51.394531 L 157.132812 5.582031 C 157.132812 2.566406 159.585938 0.109375 162.585938 0.109375 Z M 182.199219 6.316406 L 200.113281 6.316406 L 200.113281 25.296875 L 191.242188 17.789062 L 182.199219 25.296875 Z M 81.269531 65.261719 L 138.414062 65.261719 C 141.414062 65.261719 143.871094 67.71875 143.871094 70.734375 L 143.871094 116.542969 C 143.871094 119.550781 141.414062 122.007812 138.414062 122.007812 L 81.269531 122.007812 C 78.269531 122.007812 75.816406 119.550781 75.816406 116.542969 L 75.816406 70.734375 C 75.816406 67.71875 78.269531 65.261719 81.269531 65.261719 Z M 100.875 71.476562 L 118.800781 71.476562 L 118.800781 90.457031 L 109.925781 82.945312 L 100.875 90.457031 Z M 100.875 6.316406 L 118.800781 6.316406 L 118.800781 25.296875 L 109.925781 17.789062 L 100.875 25.296875 Z M 112.335938 156.960938 C 92.175781 156.960938 75.945312 173.34375 75.945312 193.421875 C 75.945312 213.625 92.296875 229.890625 112.335938 229.890625 C 132.488281 229.890625 148.726562 213.511719 148.726562 193.421875 C 148.726562 173.234375 132.375 156.960938 112.335938 156.960938 Z M 112.335938 179.394531 C 104.609375 179.394531 98.339844 185.679688 98.339844 193.421875 C 98.339844 201.171875 104.609375 207.445312 112.335938 207.445312 C 120.058594 207.445312 126.328125 201.171875 126.328125 193.421875 C 126.328125 185.679688 120.058594 179.394531 112.335938 179.394531 Z M 237.441406 134.082031 L 0 134.082031 L 0 171.648438 C 0 180.726562 7.417969 188.167969 16.492188 188.167969 L 64.265625 188.167969 C 65.484375 176.960938 70.550781 166.859375 78.128906 159.238281 L 78.148438 159.207031 L 78.203125 159.164062 C 86.953125 150.40625 99.023438 144.972656 112.335938 144.972656 C 125.664062 144.972656 137.765625 150.398438 146.527344 159.167969 C 154.101562 166.769531 159.179688 176.878906 160.394531 188.167969 L 275.398438 188.167969 C 277.859375 132.066406 358.132812 124.324219 366.308594 188.167969 L 384 188.167969 C 373.808594 117.09375 384.015625 132.816406 319.777344 107.496094 C 319.230469 99.300781 317.039062 91.070312 314.109375 82.976562 C 301.402344 47.875 280.335938 50.925781 237.441406 50.625 Z M 279.324219 69.800781 L 258.742188 69.46875 L 258.742188 107.496094 L 296.84375 107.496094 C 294.945312 95.09375 290.023438 80.445312 279.324219 69.800781 Z M 320.859375 176.164062 C 313.125 176.164062 306.863281 182.449219 306.863281 190.191406 C 306.863281 197.929688 313.125 204.214844 320.859375 204.214844 C 328.574219 204.214844 334.84375 197.929688 334.84375 190.191406 C 334.84375 182.449219 328.574219 176.164062 320.859375 176.164062 Z M 320.859375 176.164062'
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

const Map = (props: IMapProps) => {
  const {
    mode = 'view',
    locationOptions = [],
    onChangeLocationOptions,
    googleMapPath,
    trackingData,
    startPoints,
    endPoints,
    ...mapOptions
  } = props;

  const [center, setCenter] = useState(props.center || { lat: 0, lng: 0 });
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    setCenter(props.center || { lat: 0, lng: 0 });
    renderMap();
  }, [props.locationOptions, props.id, center, setCenter]);

  const mapScript = loadMapScript(
    props.googleMapApiKey || 'demo',
    props.locale
  );

  mapScript.addEventListener('load', () => {
    renderMap();
  });

  const onLocationChange = (option: ILocationOption, index: number) => {
    if (props.onChangeLocationOptions) {
      locationOptions[index] = option;
      props.onChangeLocationOptions(locationOptions);
    }
  };

  const onChangeCurrentLocation = (option: ILocationOption) => {
    if (props.onChangeMarker) {
      props.onChangeMarker(option);
    }
  };

  const renderMap = () => {
    const mapElement = document.getElementById(props.id);

    if (!mapElement || !(window as any).google) {
      return;
    }

    const map = new google.maps.Map(mapElement, {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      ...mapOptions
    });

    const addListeners = (marker: google.maps.Marker, content: string) => {
      if (content && content.length) {
        const infoWindow = new google.maps.InfoWindow({
          content
        });

        marker.addListener('mouseover', () => {
          infoWindow.open({
            anchor: marker,
            shouldFocus: false
          });
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });
      }

      if (marker.getDraggable()) {
        google.maps.event.addListener(marker, 'dragend', () => {
          const location = marker.getPosition();
          const markerTag = (marker as IMarker).tag;

          if (!location) {
            return;
          }

          if (markerTag === 'current') {
            return onChangeCurrentLocation({
              lat: location.lat(),
              lng: location.lng(),
              description: content
            });
          }

          onLocationChange(
            {
              lat: location.lat(),
              lng: location.lng(),
              description: content
            },
            Number((marker as IMarker).tag)
          );
        });
      } else {
        marker.addListener('click', () => {
          const location = marker.getPosition();

          markers.forEach(m => {
            const iconColor =
              m.getPosition() === marker.getPosition()
                ? colors.colorCoreGreen
                : colors.colorPrimary;
            m.setIcon(getIconAttributes(MAP_MARKERS.default, iconColor));
          });

          if (location) {
            onChangeCurrentLocation({
              lat: location.lat(),
              lng: location.lng(),
              description: content
            });
          }
        });
      }
    };

    const getIconAttributes = (
      marker: string,
      iconColor: string,
      pos?: google.maps.Point
    ) => {
      const anchor = pos || new google.maps.Point(33, 62);
      return {
        path: marker,
        fillColor: iconColor,
        fillOpacity: 0.9,
        anchor,
        strokeWeight: 0.8,
        strokeColor: '#ffffff',
        scale: 0.7
      };
    };

    const bounds = new google.maps.LatLngBounds();

    if (locationOptions.length > 0) {
      let markerId = 0;
      locationOptions.forEach(option => {
        let iconColor = colors.colorPrimary;

        if (option.lat === center.lat && option.lng === center.lng) {
          iconColor = colors.colorCoreGreen;
        }

        const marker = new google.maps.Marker({
          position: {
            lat: option.lat,
            lng: option.lng
          },
          map,
          title: option.description,
          draggable: mode === 'config' ? true : false,
          icon: getIconAttributes(MAP_MARKERS.default, iconColor)
        });

        (marker as IMarker).tag = String(markerId);

        bounds.extend(new google.maps.LatLng(option.lat, option.lng));

        addListeners(marker, option.description || '');

        markers.push(marker);
        setMarkers([...markers]);
        markerId++;
      });
      map.fitBounds(bounds);

      if (props.connectWithLines) {
        new google.maps.Polyline({
          path: locationOptions,
          geodesic: true,
          strokeColor: colors.colorCoreRed,
          strokeOpacity: 0.7,
          strokeWeight: 2,
          map: map
        });
      }

      if (locationOptions.length < 2) {
        return;
      }

      if (googleMapPath) {
        let path: google.maps.LatLng[] = [];

        if (typeof googleMapPath === 'string') {
          path = google.maps.geometry.encoding.decodePath(googleMapPath);
        } else {
          for (const p of googleMapPath) {
            path = [...path, ...google.maps.geometry.encoding.decodePath(p)];
          }
        }

        new google.maps.Polyline({
          path,
          strokeColor: colors.colorCoreBlue,
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map
        });
      }

      if (trackingData && trackingData.length > 0) {
        const path: google.maps.LatLng[] = [];

        for (const p of trackingData) {
          path.push(new google.maps.LatLng(p.lat, p.lng));
        }

        new google.maps.Polyline({
          path,
          strokeColor: colors.colorCoreOrange,
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map
        });

        const lastPos = trackingData[trackingData.length - 1];
        new google.maps.Marker({
          position: {
            lat: lastPos.lat,
            lng: lastPos.lng
          },
          map,
          title: new Date(lastPos.trackedDate).toISOString(),
          draggable: false,
          icon: getIconAttributes(
            MAP_MARKERS.truck,
            colors.colorCoreOrange,
            new google.maps.Point(20, 20)
          )
        });
      }

      if (startPoints && startPoints.length) {
        startPoints.forEach(startPoint => {
          new google.maps.Marker({
            position: {
              lat: startPoint.lat,
              lng: startPoint.lng
            },
            map,
            title: startPoint.description,
            draggable: false,
            icon: getIconAttributes(
              MAP_MARKERS.load,
              colors.colorCoreGreen,
              new google.maps.Point(20, 20)
            )
          });
        });

        if (endPoints && endPoints.length) {
          endPoints.forEach(endPoint => {
            new google.maps.Marker({
              position: {
                lat: endPoint.lat,
                lng: endPoint.lng
              },
              map,
              title: endPoint.description,
              draggable: false,
              icon: getIconAttributes(
                MAP_MARKERS.unload,
                colors.colorCoreRed,
                new google.maps.Point(20, 20)
              )
            });
          });
        }
      }

      return;
    }

    if (center && locationOptions.length === 0) {
      const marker = new google.maps.Marker({
        position: {
          lat: center.lat,
          lng: center.lng
        },
        map,
        title: center.description || 'your location',
        draggable: true,
        icon: getIconAttributes(MAP_MARKERS.default, colors.colorPrimary)
      });

      (marker as IMarker).tag = 'current';

      marker.setPosition(center);
      addListeners(marker, 'your location');
    }
  };

  return <MapContainer id={props.id} fullHeight={props.fullHeight} />;
};

export default Map;
