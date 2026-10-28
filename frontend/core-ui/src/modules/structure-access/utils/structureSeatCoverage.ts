import type { TFunction } from 'i18next';
import type { TStructureSeatCoverage } from 'ui-modules';

export const STRUCTURE_SEAT_COVERAGES: TStructureSeatCoverage[] = [
  'node',
  'below',
  'selected',
];

export interface IStructureSeatCoverageSource {
  coverage: TStructureSeatCoverage;
  coveredEntityIds?: string[];
  coveredEntities?: { _id: string; title: string }[];
}

export const getStructureSeatCoverageLabel = (
  { coverage, coveredEntityIds, coveredEntities }: IStructureSeatCoverageSource,
  t: TFunction,
) => {
  if (coverage === 'selected') {
    const count = coveredEntities?.length ?? coveredEntityIds?.length ?? 0;

    return t('coverage-selected-count', { count });
  }

  return t(`coverage-${coverage}`);
};

export const getStructureSeatCoveredTitles = ({
  coveredEntityIds,
  coveredEntities,
}: IStructureSeatCoverageSource) => {
  const titles = new Map(
    (coveredEntities ?? []).map(({ _id, title }) => [_id, title]),
  );

  return (coveredEntityIds ?? [...titles.keys()]).map(
    (id) => titles.get(id) ?? id,
  );
};

export const getStructureManager = <H extends { _id: string }>(
  seats: { coverage: TStructureSeatCoverage; holders?: H[] }[],
) => {
  const held = seats.filter((seat) => seat.holders?.length);
  const seat = held.find(({ coverage }) => coverage === 'below') ?? held[0];

  return seat?.holders?.[0];
};
