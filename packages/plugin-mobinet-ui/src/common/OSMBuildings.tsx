import React, { useEffect, useState } from 'react';
import { ICoordinates } from '../types';

type Props = {
  id: string;
  // width?: string;
  // height?: string;
  style?: any;
  center?: ICoordinates;

  onChangeCenter?: (center: ICoordinates, bounds: ICoordinates[]) => void;
  onChange: (data: any) => void;
  onload?: (bounds: ICoordinates[], mapRef: any) => void;
};

const Map = (props: Props) => {
  const [center, setCenter] = useState<ICoordinates | undefined>(props.center);

  const mapRef = React.useRef(null);

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
    script.src = 'http://localhost:3000/js/osmb.js';
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
        longitude: 106.9154893
      },
      // state: true,
      tilt: 60,
      zoom: 16,
      fastMode: true,
      minZoom: 10,
      // maxZoom: 30,
      style: 'object',
      attribution:
        '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    });

    map.addMapTiles('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a>'
    });

    map.addGeoJSONTiles(
      'http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json'
    );

    map.on('doubleclick', e => {
      console.log('double click', e);
    });

    map.on('pointerup', e => {
      if (!e.features || e.features.length === 0) {
        return;
      }

      console.log('selected feature ', e.features[0]);

      props.onChange(e.features[0]);
    });

    map.on('change', _e => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        const pos = map.getPosition();
        const bounds = map.getBounds();

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
            bounds.map(bound => ({
              lat: bound.latitude,
              lng: bound.longitude
            }))
          );
        return;
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    });

    map.addGeoJSON('http://localhost:3000/geojson/custom.json');

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
        map.getBounds().map(bound => {
          return {
            lat: bound.latitude,
            lng: bound.longitude
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
