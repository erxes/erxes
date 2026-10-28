import type { IStructureEntityType } from 'ui-modules';

const allowsParent = (
  { parentTypeIds }: Pick<IStructureEntityType, 'parentTypeIds'>,
  parentTypeId?: string,
) =>
  !parentTypeIds?.length ||
  (!!parentTypeId && parentTypeIds.includes(parentTypeId));

export const getStructureChangeableTypes = <
  T extends Pick<IStructureEntityType, '_id' | 'isSystem' | 'parentTypeIds'>,
>(
  types: T[],
  {
    parentTypeId,
    childTypeIds,
  }: { parentTypeId?: string; childTypeIds: string[] },
) => {
  const childTypes = types.filter(({ _id }) => childTypeIds.includes(_id));

  return types.filter(
    (type) =>
      !type.isSystem &&
      allowsParent(type, parentTypeId) &&
      childTypes.every((childType) => allowsParent(childType, type._id)),
  );
};
