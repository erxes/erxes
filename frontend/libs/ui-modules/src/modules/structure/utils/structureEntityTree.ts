import {
  IStructureEntity,
  IStructureEntityTreeNode,
} from '../types/StructureEntity';

export const getStructureEntityTree = (
  entities: IStructureEntity[],
): IStructureEntityTreeNode[] => {
  const listedIds = new Set(entities.map(({ _id }) => _id));
  const paths = entities.map(({ order }) =>
    order.split('/').filter((id) => listedIds.has(id)),
  );
  const parentIds = new Set(paths.flatMap((path) => path.slice(0, -1)));

  return entities.map((entity, index) => ({
    entity,
    order: `${paths[index].join('/')}/`,
    hasChildren: parentIds.has(entity._id),
  }));
};
