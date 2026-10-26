import { Label, Skeleton } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranchLocationField } from '../../../hooks/useBranchLocationField';
import { BranchCoordinateSummary } from './BranchCoordinateSummary';
import { BranchLocationSearch } from './BranchLocationSearch';
import { BranchRadiusField } from './BranchRadiusField';

// Leaflet and its stylesheet load only when a branch sheet opens
const BranchLocationMap = lazy(() =>
  import('./BranchLocationMap').then((module) => ({
    default: module.BranchLocationMap,
  })),
);

export const BranchLocationField = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    position,
    setPosition,
    radius,
    setRadius,
    fallbackCenter,
    search,
    currentLocation,
    clear,
  } = useBranchLocationField();

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <Label>{t('location')}</Label>
      <BranchLocationSearch search={search} currentLocation={currentLocation} />
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-lg" />}>
        <BranchLocationMap
          position={position}
          radius={radius}
          fallbackCenter={fallbackCenter}
          onChange={setPosition}
        />
      </Suspense>
      <BranchRadiusField radius={radius} onChange={setRadius} />
      <BranchCoordinateSummary position={position} onClear={clear} />
    </div>
  );
};
