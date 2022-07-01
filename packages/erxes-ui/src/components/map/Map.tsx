import { LinkButton, MapContainer } from '@erxes/ui/src/styles/main';
import React, { useEffect, useState } from 'react';
import { ILocationOption } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';
import colors from '../../styles/colors';
import {} from './mapTypes';
import LocationOption from '@erxes/ui-settings/src/properties/components/LocationOption';
import Icon from '../Icon';

interface IMapProps extends google.maps.MapOptions {
  id: string;
  googleMapApiKey: string;
  center?: ILocationOption;
  locationOptions: ILocationOption[];
  locale?: string;
  mode?: 'default' | 'edit' | 'view';
  connectWithLines?: boolean;
  onChangeMarker?: (location: ILocationOption) => void;
  onChangeOptions?: (locations: ILocationOption[]) => void;
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
  const { mode = 'default', onChangeOptions, ...options } = props;

  const [locationOptions, setOptions] = useState<ILocationOption[]>(
    props.locationOptions
  );
  const [center, setCenter] = useState(props.center || { lat: 0, lng: 0 });
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    renderMap();
    setCenter(props.center || { lat: 0, lng: 0 });
  }, [props.id, center, setCenter]);

  const mapScript = loadMapScript(
    props.googleMapApiKey || 'demo',
    props.locale
  );

  mapScript.addEventListener('load', () => {
    renderMap();
  });

  const onLocationChange = (option: ILocationOption) => {
    console.log('onLocationChange: ', option);
    // setCenter(option);
    // if (props.onChangeMarker) {
    //   props.onChangeMarker(option);
    // }
  };

  const renderMap = () => {
    console.log('renderMap: ');
    const mapElement = document.getElementById(props.id);

    if (!mapElement || !(window as any).google) {
      return;
    }

    const map = new google.maps.Map(mapElement, {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      ...options
    });

    const addListeners = (
      marker: google.maps.Marker,
      content: string,
      draggable: boolean
    ) => {
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

      if (draggable) {
        google.maps.event.addListener(marker, 'dragend', () => {
          const location = marker.getPosition();
          if (location) {
            onLocationChange({
              lat: location.lat(),
              lng: location.lng(),
              description: content
            });
          }
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
            onLocationChange({
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
          draggable: false,
          icon: getIconAttributes(MAP_MARKERS.default, iconColor)
        });

        bounds.extend(new google.maps.LatLng(option.lat, option.lng));

        addListeners(marker, option.description || '', false);

        markers.push(marker);
        setMarkers([...markers]);
      });
      map.fitBounds(bounds);

      if (!props.connectWithLines) {
        return;
      }

      new google.maps.Polyline({
        path: locationOptions,
        geodesic: true,
        strokeColor: colors.colorCoreRed,
        strokeOpacity: 0.7,
        strokeWeight: 2,
        map: map
      });

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

      marker.setPosition(center);
      addListeners(marker, 'your location', true);
    }
  };

  const renderInput = () => {
    if (mode === 'default') {
      return null;
    }

    const onChangeOption = (option, index) => {
      // find current editing one
      const currentOption = locationOptions.find((_option, i) => i === index);

      // set new value
      if (currentOption) {
        locationOptions[index] = option;
      }

      setOptions(locationOptions);
      onChangeOptions && onChangeOptions(locationOptions);
    };

    const addOption = () => {
      const option: any = center || {
        lat: 0.0,
        lng: 0.0,
        description: ''
      };

      locationOptions.push(option);

      setOptions([...locationOptions]);
      onChangeOptions && onChangeOptions(locationOptions);
    };

    const removeOption = (index: number) => {
      setOptions(locationOptions.filter((_option, i) => i !== index));
      onChangeOptions && onChangeOptions(locationOptions);
    };

    return (
      <>
        {locationOptions.map((option, index) => (
          <LocationOption
            key={index}
            option={option}
            onChangeOption={onChangeOption}
            removeOption={mode === 'edit' ? removeOption : undefined}
            index={index}
          />
        ))}

        {!locationOptions.length && (
          <LocationOption
            key={0}
            option={{ ...center, description: '' }}
            onChangeOption={option => {
              onChangeOptions && onChangeOptions([option]);
            }}
            removeOption={mode === 'edit' ? removeOption : undefined}
            index={0}
          />
        )}

        {mode === 'edit' && (
          <LinkButton onClick={addOption}>
            <Icon icon="plus-1" /> Add option
          </LinkButton>
        )}
      </>
    );
  };

  return (
    <>
      <MapContainer id={props.id} />
      {renderInput()}
    </>
  );
};

export default Map;
