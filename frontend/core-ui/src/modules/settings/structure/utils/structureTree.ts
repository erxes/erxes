import type { IStructureEntityType } from 'ui-modules';
import type {
  IStructureEntityPathItem,
  IStructureTreeRow,
  TStructureTreeEntity,
} from '../types/structureEntity';
import type { TLatLng } from '../types/structureLocation';
import { isValidLatLng } from './parseCoordinates';

const compareTitles = (
  a: Pick<TStructureTreeEntity, 'title'>,
  b: Pick<TStructureTreeEntity, 'title'>,
) => a.title.localeCompare(b.title);

export const getStructureAncestorIds = ({
  _id,
  order,
}: Pick<TStructureTreeEntity, '_id' | 'order'>) =>
  order.split('/').filter((id) => id && id !== _id);

export const groupStructureTree = <T extends TStructureTreeEntity>(
  entities: T[],
) => {
  const ids = new Set(entities.map(({ _id }) => _id));
  const roots: T[] = [];
  const childrenById = new Map<string, T[]>();

  for (const entity of entities) {
    if (entity.parentId && ids.has(entity.parentId)) {
      childrenById.set(entity.parentId, [
        ...(childrenById.get(entity.parentId) ?? []),
        entity,
      ]);
    } else {
      roots.push(entity);
    }
  }

  roots.sort(compareTitles);
  childrenById.forEach((children) => children.sort(compareTitles));

  return { roots, childrenById };
};

export const flattenStructureTree = <T extends TStructureTreeEntity>({
  entities,
  isExpanded,
}: {
  entities: T[];
  isExpanded: (entity: T, depth: number) => boolean;
}): IStructureTreeRow<T>[] => {
  const { roots, childrenById } = groupStructureTree(entities);
  const rows: IStructureTreeRow<T>[] = [];

  const visit = (entity: T, depth: number) => {
    const children = childrenById.get(entity._id) ?? [];
    const expanded = isExpanded(entity, depth);

    rows.push({ entity, depth, hasChildren: children.length > 0, expanded });

    if (expanded) {
      children.forEach((child) => visit(child, depth + 1));
    }
  };

  roots.forEach((root) => visit(root, 0));

  return rows;
};

const getStructureDominantTypeId = (typeIds: string[]) => {
  const counts = new Map<string, number>();

  typeIds.forEach((typeId) =>
    counts.set(typeId, (counts.get(typeId) ?? 0) + 1),
  );

  let dominant: string | undefined;
  let best = 0;
  let tied = false;

  counts.forEach((count, typeId) => {
    if (count > best) {
      dominant = typeId;
      best = count;
      tied = false;
    } else if (count === best) {
      tied = true;
    }
  });

  return tied ? undefined : dominant;
};

export const getStructureCollapsedLabel = (
  children: Pick<TStructureTreeEntity, 'typeId'>[],
  typesById: Map<string, Pick<IStructureEntityType, 'name'>>,
) => {
  const dominant = getStructureDominantTypeId(
    children.map(({ typeId }) => typeId),
  );
  const typeName = dominant ? typesById.get(dominant)?.name : undefined;

  return typeName ? `+${children.length} ${typeName}` : `+${children.length}`;
};

export const getAllowedChildTypes = <
  T extends Pick<IStructureEntityType, '_id' | 'isSystem' | 'parentTypeIds'>,
>(
  types: T[],
  parentTypeId?: string,
) =>
  types.filter(
    ({ isSystem, parentTypeIds }) =>
      !isSystem &&
      (!parentTypeIds?.length ||
        (!!parentTypeId && parentTypeIds.includes(parentTypeId))),
  );

export const getStructureDefaultChildTypeId = (
  siblings: Pick<TStructureTreeEntity, 'typeId'>[],
  allowedTypes: Pick<IStructureEntityType, '_id'>[],
) => {
  const dominant = getStructureDominantTypeId(
    siblings.map(({ typeId }) => typeId),
  );

  return (
    allowedTypes.find(({ _id }) => _id === dominant)?._id ??
    allowedTypes[0]?._id
  );
};

export const searchStructurePlaces = <T extends TStructureTreeEntity>(
  entities: T[],
  query: string,
  limit: number,
) => {
  const text = query.trim().toLowerCase();

  if (!text) {
    return [];
  }

  const rankOf = ({ title, code }: T) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.startsWith(text)) {
      return 0;
    }

    if (lowerTitle.includes(text)) {
      return 1;
    }

    return code?.toLowerCase().includes(text) ? 2 : -1;
  };

  return entities
    .map((entity) => ({ entity, rank: rankOf(entity) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || compareTitles(a.entity, b.entity))
    .slice(0, limit)
    .map(({ entity }) => entity);
};

export const canMoveStructureEntity = (
  entity: Pick<TStructureTreeEntity, 'parentId' | 'order'>,
  target: Pick<TStructureTreeEntity, '_id' | 'order'>,
) =>
  Boolean(entity.parentId) &&
  entity.parentId !== target._id &&
  !target.order.startsWith(entity.order);

export const getStructureFallbackCenter = (
  path?: IStructureEntityPathItem[],
): TLatLng | null => {
  for (const { location } of [...(path ?? [])].reverse()) {
    const latitude = location?.coordinate?.latitude;
    const longitude = location?.coordinate?.longitude;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (latitude && longitude && isValidLatLng(lat, lng)) {
      return { lat, lng };
    }
  }

  return null;
};
