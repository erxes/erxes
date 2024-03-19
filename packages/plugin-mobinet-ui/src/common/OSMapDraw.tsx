import 'leaflet/dist/leaflet.css';

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map as MapFiber } from '@react-ol/fiber';
import { Stroke, Fill } from 'ol/style';
import { fromLonLat, fromUserExtent, transform } from 'ol/proj';
import { ICoordinates } from '../types';
import { useMap, useMapEvents } from 'react-leaflet';

type Props = {
  id: string;
  center?: {
    lat: number;
    lng: number;
  };

  onChangeCenter?: (position: ICoordinates, bounds: ICoordinates[]) => void;
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
  const viewRef = useRef();

  return (
    <MapFiber>
      <olView
        ref={viewRef}
        onChange_view={(d) => {
          console.log('change view');
          console.log(d);
        }}
        onChange={(d) => {
          console.log('change normal');
          console.log(d.target);
          console.log('??');
          const src = 'EPSG:3857';
          const dest = 'EPSG:4326';
          console.log(transform(d.target.targetCenter_, src, dest));
          const d1 =
            d.target.targetCenter_[0] - d.target.projection_.extent_[0];
          const d2 =
            d.target.targetCenter_[1] - d.target.projection_.extent_[1];
          console.log('pisda');
          console.log(transform([d1, d2], src, dest));
          // d.target.targetCenter_.values_.zoom
        }}
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
