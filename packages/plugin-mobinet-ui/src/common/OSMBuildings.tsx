import React, { useEffect, useState } from 'react';

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
  center?: {
    lat: number;
    lng: number;
  };
  onClickBuilding: (e: any) => void;
};

const Map = (props: Props) => {
  const mapScript = loadMapScript();
  const mapRef = React.useRef(null);

  useEffect(() => {
    renderMap();

    return () => {
      if (mapRef.current) {
        (mapRef.current as any).destroy();
      }
    };
  }, []);

  mapScript.addEventListener('load', () => {
    renderMap();
  });

  const renderMap = () => {
    const mapElement = document.getElementById(props.id);

    if (!mapElement || !(window as any).OSMBuildings) {
      console.log('mapElement not found');
      return;
    }

    const map = new (window as any).OSMBuildings({
      container: props.id,
      position: props.center || { latitude: 47.918812, longitude: 106.9154893 },
      state: false,
      tilt: 60,
      zoom: 16,
      fastMode: false,
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

    map.addGeoJSON('http://localhost:3000/geojson/custom.json');

    map.appendTo(props.id);

    mapRef.current = map;
  };

  return <div id={props.id} style={{ width: '100%', height: '100%' }} />;
};

export default Map;
