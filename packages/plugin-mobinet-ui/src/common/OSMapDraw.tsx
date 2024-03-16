import 'leaflet/dist/leaflet.css';

import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import { Map as MapFiber } from '@react-ol/fiber';
import { Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { ICoordinates } from '../types';

type Props = {
  id: string;
  center?: {
    lat: number;
    lng: number;
  };

  onChangeCenter?: (position: any) => void;
  onPyloganDrawn: (coords: ICoordinates[]) => void;
};

const fill = new Fill({
  color: '#00bbff',
});
const stroke = new Stroke({
  color: '#ffcc33',
  width: 2,
});
const circleFill = new Fill({
  color: '#ffcc33',
});

const MapDraw = (props: Props) => {
  const [vectorSource, setVectorSource] = useState();

  return (
    <MapFiber>
      <olView
        initialCenter={fromLonLat([
          props.center?.lng || 0,
          props.center?.lat || 0,
        ])}
        initialZoom={15}
      />
      <olLayerTile>
        <olSourceOSM />
      </olLayerTile>
      <olLayerVector>
        <olSourceVector ref={setVectorSource} />
        <olStyleStyle attach="style" fill={fill} stroke={stroke}>
          <olStyleCircle
            attach="image"
            args={{ radius: 7, fill: circleFill }}
          />
        </olStyleStyle>
      </olLayerVector>
      {vectorSource ? (
        <>
          <olInteractionModify source={vectorSource} />
          <olInteractionDraw
            args={{
              type: 'Polygon',
              source: vectorSource,
              snapTolerance: 30,
            }}
            onDrawend={(d) => {
              const src = 'EPSG:3857';
              const dest = 'EPSG:4326';

              const points = d.feature
                .getGeometry()
                ?.clone()
                .transform(src, dest);

              if (points)
                if ('flatCoordinates' in points) {
                  const list = points?.flatCoordinates as [];
                  console.log('list polygon');
                  console.log(list);
                  const ff: ICoordinates[] = [];
                  for (let i = 0; i < list.length; i = i + 2) {
                    ff.push({ lng: list[i], lat: list[i + 1] });
                  }
                  console.log(ff);
                  props.onPyloganDrawn(ff);
                }
            }}
          />
          <olInteractionSnap
            source={vectorSource}
            args={{ pixelTolerance: 30 }}
          />
        </>
      ) : null}
    </MapFiber>
  );
};

export default MapDraw;
