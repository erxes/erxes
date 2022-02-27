import * as React from "react";
import * as fe from "fast-equals";

interface IMapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
}

const Map: React.FC<IMapProps> = ({ children, style, ...options }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | undefined>(undefined);

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
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
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
};

const useDeepCompareMemoize = (value: any) => {
  const ref = React.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
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
