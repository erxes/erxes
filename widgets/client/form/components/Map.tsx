import { createCustomEqual } from 'fast-equals';
import * as React from 'react';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';

interface IMapProps extends google.maps.MapOptions {
	style: { [key: string]: string };
}

const Map: React.FC<IMapProps> = ({ children, style, ...options }) => {
	const ref = React.useRef<HTMLDivElement>(null);
	const [map, setMap] = React.useState<google.maps.Map | undefined>(
		undefined
	);

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
			{React.Children.map(children, child => {
				if (React.isValidElement(child)) {
					return React.cloneElement(child, { map });
				}
			})}
		</>
	);
};

const deepCompareEqualsForMaps = createCustomEqual(
	deepEqual => (a: any, b: any) => {
		if (
			isLatLngLiteral(a) ||
			a instanceof google.maps.LatLng ||
			isLatLngLiteral(b) ||
			b instanceof google.maps.LatLng
		) {
			return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
		}

		return deepEqual(a, b);
	}
);

function useDeepCompareMemoize(value: any) {
	const ref = React.useRef(() => {
		throw new Error('Cannot call an event handler while rendering.');
	});

	if (!deepCompareEqualsForMaps(value, ref.current)) {
		ref.current = value;
	}

	return ref.current;
}

function useDeepCompareEffectForMaps(
	callback: React.EffectCallback,
	dependencies: any[]
) {
	React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export default Map;
