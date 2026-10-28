import { Skeleton } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { useStructureLocationField } from '../../hooks/useStructureLocationField';
import { TLatLng } from '../../types/structureLocation';
import { StructureCoordinateSummary } from './StructureCoordinateSummary';
import { StructureLocationSearch } from './StructureLocationSearch';
import { StructureRadiusField } from './StructureRadiusField';

const StructureLocationMap = lazy(() =>
  import('./StructureLocationMap').then((module) => ({
    default: module.StructureLocationMap,
  })),
);

export const StructureLocationField = ({
  fallbackCenter,
}: {
  fallbackCenter: TLatLng | null;
}) => {
  const {
    position,
    setPosition,
    radius,
    setRadius,
    search,
    currentLocation,
    clear,
  } = useStructureLocationField(fallbackCenter);

  return (
    <div className="flex flex-col gap-2">
      <StructureLocationSearch
        search={search}
        currentLocation={currentLocation}
      />
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-lg" />}>
        <StructureLocationMap
          position={position}
          radius={radius}
          fallbackCenter={fallbackCenter}
          onChange={setPosition}
        />
      </Suspense>
      <StructureRadiusField radius={radius} onChange={setRadius} />
      <StructureCoordinateSummary position={position} onClear={clear} />
    </div>
  );
};
