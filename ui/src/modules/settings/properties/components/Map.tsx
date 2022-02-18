import * as fe from 'fast-equals';
import React from 'react';

interface IMapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  mapKey: string;
}

const Map: React.FC<IMapProps> = ({ children, style, mapKey, ...options }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | undefined>(undefined);
  const [isMapLoaded, setMapLoaded] = React.useState(false);

  (window as any).mapCallback = () => {
    console.log('mapLoaded');
    setMapLoaded(true);
  };

  React.useEffect(() => {
    if (ref.current && !map && isMapLoaded) {
      console.log('MAP INIT');
      setMap(new (window as any).google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  return (
    <>
      <div ref={ref} style={style} />
      {map &&
        React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { map } as any);
          }
          return;
        })}
    </>
  );
};

const useDeepCompareMemoize = (value: any) => {
  const ref = React.useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  if (!fe.deepEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

const useDeepCompareEffectForMaps = (
  callback: React.EffectCallback,
  dependencies: any[]
) => {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
};

export default Map;
