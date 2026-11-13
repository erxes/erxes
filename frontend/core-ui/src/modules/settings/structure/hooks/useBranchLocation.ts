import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TBranchForm } from '../types/branch';
import { TLatLng } from '../types/branchLocation';
import { isValidLatLng } from '../utils/parseCoordinates';

export const useBranchLocation = () => {
  const { control, setValue } = useFormContext<TBranchForm>();
  const [latitude, longitude, radius] = useWatch({
    control,
    name: ['coordinate.latitude', 'coordinate.longitude', 'radius'],
  });

  const position = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    return latitude && longitude && isValidLatLng(lat, lng)
      ? { lat, lng }
      : null;
  }, [latitude, longitude]);

  const setPosition = useCallback(
    (next: TLatLng | null) =>
      // Stored as strings; six decimals is ~10 cm, finer than any phone GPS
      setValue(
        'coordinate',
        next
          ? { latitude: next.lat.toFixed(6), longitude: next.lng.toFixed(6) }
          : null,
        { shouldDirty: true, shouldValidate: true },
      ),
    [setValue],
  );

  const setRadius = useCallback(
    (value: number) => setValue('radius', value, { shouldDirty: true }),
    [setValue],
  );

  return { position, setPosition, radius: radius ?? 0, setRadius };
};
