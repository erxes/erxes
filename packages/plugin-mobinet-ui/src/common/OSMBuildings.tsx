import React, { useEffect, useState } from 'react';
import { ICoordinates } from '../types';

const loadMapScript = () => {
  const scripts: any = document.getElementsByTagName('script');

  // Go through existing script tags, and return osmbuildings tag when found.
  for (const script of scripts) {
    if (script.src.includes('osmb.js')) {
      return script;
    }
  }

  const osmScript = document.createElement('script');
  osmScript.src = 'http://localhost:3000/js/osmb.js';
  osmScript.async = true;
  osmScript.defer = true;

  window.document.body.appendChild(osmScript);

  return osmScript;
};

type Props = {
  id: string;
  width?: string;
  height?: string;
  center?: ICoordinates;

  onChangeCenter?: (center: ICoordinates, bounds: ICoordinates[]) => void;
  onClickBuilding: (e: any) => void;
};

const Map = (props: Props) => {
  console.log('props', props);

  const { center } = props;
  const mapScript = loadMapScript();
  const mapRef = React.useRef(null);

  // console.log('center', center && {latitude: center.lat, longitude: center.lng} || { latitude: 47.918812, longitude: 106.9154893 });
  console.log('props.id', props.id);
  useEffect(() => {
    if (mapScript) {
      renderMap();
    }

    // 0.0722562821874293

    // if (mapRef.current, center) {
    //   const map = (mapRef.current as any);
    //   if (!map) {
    //     return;
    //   }

    //   // map.setPosition(center && {latitude: center.lat, longitude: center.lng} || { latitude: 47.918812, longitude: 106.9154893 });
    //   return;
    // }

    return () => {
      if (mapRef.current) {
        (mapRef.current as any).destroy();
      }

      mapRef.current = null;

      mapScript.removeEventListener('load', renderMap);
      mapScript.remove();
    };
  }, [mapScript]);

  mapScript.addEventListener('load', () => {
    console.log('loaddddddddddddddddd');
    renderMap();
  });

  const renderMap = () => {
    console.log('renderMap');
    const mapElement = document.getElementById(props.id);

    if (!mapElement || !(window as any).OSMBuildings) {
      console.log('mapElement not found');
      return;
    }

    console.log('map refffff ', mapRef.current);

    const map = new (window as any).OSMBuildings({
      container: props.id,
      position: (center && { latitude: center.lat, longitude: center.lng }) || {
        latitude: 47.918812,
        longitude: 106.9154893
      },
      state: true,
      tilt: 60,
      zoom: 16,
      fastMode: true,
      minZoom: 10,
      maxZoom: 30,
      style: 'object',
      attribution:
        '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    });

    map.off();
    map.on();

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
      if (!e.features) {
        map.highlight(() => {});
        return;
      }

      const featureIDList = e.features.map(feature => feature.id);

      map.highlight(feature => {
        if (featureIDList.indexOf(feature.id) > -1) {
          props.onClickBuilding(feature);
          console.log('feature: ', feature);
          return '#ff0000';
        }
      });
    });

    map.on('change', e => {
      const pos = map.getPosition();
      const bounds = map.getBounds();

      props.onChangeCenter &&
        props.onChangeCenter(
          { lat: pos.latitude, lng: pos.longitude },
          bounds.map(bound => ({ lat: bound.latitude, lng: bound.longitude }))
        );
    });

    map.addGeoJSON('http://localhost:3000/geojson/custom.json');

    map.appendTo(props.id);

    mapRef.current = map;
  };

  return (
    <div
      id={props.id}
      style={{ width: props.width || '100%', height: props.height || '100%' }}
    />
  );
};

export default Map;
