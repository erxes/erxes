import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IStructureLocationForm } from '../types/structureEntity';
import { TLatLng } from '../types/structureLocation';
import { isValidLatLng } from '../utils/parseCoordinates';

export const useStructureLocation = () => {
  const { control, setValue } = useFormContext<IStructureLocationForm>();
  const [latitude, longitude, radius] = useWatch({
    control,
    name: [
      'location.coordinate.latitude',
      'location.coordinate.longitude',
      'location.radius',
    ],
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
      setValue(
        'location.coordinate',
        next
          ? { latitude: next.lat.toFixed(6), longitude: next.lng.toFixed(6) }
          : null,
        { shouldDirty: true, shouldValidate: true },
      ),
    [setValue],
  );

  const setRadius = useCallback(
    (value: number) =>
      setValue('location.radius', value, { shouldDirty: true }),
    [setValue],
  );

  return { position, setPosition, radius: radius ?? 0, setRadius };
};
