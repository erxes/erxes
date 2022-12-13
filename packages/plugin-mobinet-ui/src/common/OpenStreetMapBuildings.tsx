import React, { useEffect, useState } from 'react';

const loadMapScript = () => {
  const scripts: any = document.getElementsByTagName('script');

  // Go through existing script tags, and return osmbuildings tag when found.
  for (const script of scripts) {
    if (script.src.includes('osmb.js')) {
      console.log('script found');
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

const markerSvg =
  'M32 62c0-17.1 16.3-25.2 17.8-39.7A18 18 0 1 0 14 20a18.1 18.1 0 0 0 .2 2.2C15.7 36.8 32 44.9 32 62z';

const getIconAttributes = (marker: string, iconColor: string, pos?: any) => {
  const anchor = pos || [33, 62];
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

    console.log('mapElement: ', mapElement);

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

    map.on('pointerdown', e => {
      console.log('e: ', map.getPosition());
      const pos = map.getPosition();

      map.addMarker(pos, '', {
        url: 'https://www.svgrepo.com/show/38705/location-pin.svg',
        color: '#ff0000'
      });
    });

    map.appendTo(props.id);

    mapRef.current = map;
  };

  return <div id={props.id} style={{ width: '100%', height: '100%' }} />;
};

export default Map;
