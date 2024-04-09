import React, { useEffect, useState } from 'react';
import { ICoordinates } from '../types';
import { IBuilding } from '../modules/buildings/types';
import { getEnv } from '@erxes/ui/src/utils/core';

type Props = {
  id: string;
  // width?: string;
  // height?: string;
  style?: any;
  center?: ICoordinates;
  buildings: IBuilding[];
  onChangeCenter?: (center: ICoordinates, bounds: ICoordinates[]) => void;
  onChange: (data: any) => void;
  onload?: (bounds: ICoordinates[], mapRef: any) => void;
};

const Map = (props: Props) => {
  const [center, setCenter] = useState<ICoordinates | undefined>(props.center);
  const [isInited, setIsInited] = useState(false);

  const mapRef = React.useRef(null);

  const { REACT_APP_API_URL = '' } = getEnv();

  let timer: any = null;

  useEffect(() => {
    const scripts = document.getElementsByTagName('script');

    for (const s of scripts) {
      if (s.id === props.id) {
        renderMap();
        return;
      }
    }

    const script: any = document.createElement('script');
    script.src = `${REACT_APP_API_URL}/pl:mobinet/static/assets/osmb.js`;
    script.async = true;
    script.defer = true;
    script.id = props.id;

    window.document.body.appendChild(script);

    script.onload = () => {
      renderMap();
    };

    setCenter(props.center || { lat: 47.918812, lng: 106.9154893 });

    return () => {
      window.document.body.removeChild(script);

      (window as any).OSMBuildings = null;
      mapRef.current = null;
    };
  }, [props.id]);

  const renderMap = () => {
    const mapElement = document.getElementById(props.id);

    if (!mapElement || !(window as any).OSMBuildings) {
      return;
    }

    const map = new (window as any).OSMBuildings({
      container: props.id,
      position: (center && { latitude: center.lat, longitude: center.lng }) || {
        latitude: 47.918812,
        longitude: 106.9154893,
      },
      // state: true,
      tilt: 60,
      zoom: 16,
      fastMode: true,
      minZoom: 10,
      // maxZoom: 30,
      style: 'object',
      attribution:
        '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>',
    });

    const bounds = map.getBounds();

    map.addMapTiles('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a>',
    });

    // map.addGeoJSONTiles(
    //   'https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json',
    // );

    const boundsJson = JSON.stringify(bounds);

    map.addGeoJSON(
      `${REACT_APP_API_URL}/pl:mobinet/buildings?bounds=${boundsJson}`
    );



    map.on('doubleclick', (e) => {
      console.log('double click', e);
    });

    map.on('pointerup', (e) => {
      console.log('pointerup', e)
      if (!e.features || e.features.length === 0) {
        return;
      }

      props.onChange(e.features[0]);
    });

    map.on('change', (_e) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        const pos = map.getPosition();
        const currentBounds = map.getBounds();

        if (
          center &&
          center.lat === pos.latitude &&
          center.lng === pos.longitude
        ) {
          return;
        }

        props.onChangeCenter &&
          props.onChangeCenter(
            { lat: pos.latitude, lng: pos.longitude },
            currentBounds.map((bound) => ({
              lat: bound.latitude,
              lng: bound.longitude,
            }))
          );

        const boundsJson = JSON.stringify(currentBounds);

        map.addGeoJSON(
          `${REACT_APP_API_URL}/pl:mobinet/buildings?bounds=${boundsJson}`
        );

        return;
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    });

    map.addGeoJSON(
      'http://localhost:4000/pl:mobinet/static/assets/custom.json'
    );
    // map.addGeoJSON('http://localhost:4000/pl:mobinet/buildings?bounds=[{%22longitude%22:106.92151974962191,%22latitude%22:47.9127473511875},{%22longitude%22:106.93385665926432,%22latitude%22:47.9127473511875},{%22longitude%22:106.9474390144251,%22latitude%22:47.94585990212495},{%22longitude%22:106.90793739446113,%22latitude%22:47.94585990212495}]')

    // if (props.selectedValues && props.selectedValues.length > 0) {
    //   map.highlight((feature) => {
    //     if (
    //       props.selectedValues &&
    //       props.selectedValues.indexOf(feature.id) > -1
    //     ) {
    //       return '#ff0000';
    //     }
    //   });
    // }

    map.appendTo(props.id);

    mapRef.current = map;

    props.onload &&
      props.onload(
        map.getBounds().map((bound) => {
          return {
            lat: bound.latitude,
            lng: bound.longitude,
          };
        }),
        mapRef
      );
  };

  return (
    <div
      id={props.id}
      style={props.style || { width: '100%', height: '100%' }}
    />
  );
};

export default Map;
