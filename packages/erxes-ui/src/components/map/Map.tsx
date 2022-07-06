import { MapContainer } from '@erxes/ui/src/styles/main';
import React, { useEffect, useState } from 'react';
import { ILocationOption } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';
import colors from '../../styles/colors';
import {} from './mapTypes';

export interface IMapProps extends google.maps.MapOptions {
  id: string;
  googleMapApiKey?: string;
  center?: ILocationOption;
  locationOptions: ILocationOption[];
  locale?: string;
  connectWithLines?: boolean;
  googleMapPath?: string | string[];
  mode?: 'view' | 'config';
  onChangeMarker?: (location: ILocationOption) => void;
  onChangeLocationOptions?: (locationOptions: ILocationOption[]) => void;
}

interface IMarker extends google.maps.Marker {
  tag: string;
}

const MAP_MARKERS = {
  default:
    'M32 62c0-17.1 16.3-25.2 17.8-39.7A18 18 0 1 0 14 20a18.1 18.1 0 0 0 .2 2.2C15.7 36.8 32 44.9 32 62z',
  ALL: [
    {
      default:
        'M32 62c0-17.1 16.3-25.2 17.8-39.7A18 18 0 1 0 14 20a18.1 18.1 0 0 0 .2 2.2C15.7 36.8 32 44.9 32 62z'
    }
  ]
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

    const getIconAttributes = (marker: string, iconColor: string) => {
      return {
        path: marker,
        fillColor: iconColor,
        fillOpacity: 0.9,
        anchor: new google.maps.Point(33, 62),
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

  return <MapContainer id={props.id} />;
};

export default Map;
