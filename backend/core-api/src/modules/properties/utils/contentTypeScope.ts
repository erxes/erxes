import { IModels } from '~/connectionResolvers';
import { STRUCTURE_PROPERTIES_CONTENT_TYPE } from '@/organization/structure/constants';

export const assertContentTypeScope = async (
  models: IModels,
  {
    contentType,
    contentTypeId,
    groupId,
  }: { contentType?: string; contentTypeId?: string; groupId?: string },
) => {
  if (contentType !== STRUCTURE_PROPERTIES_CONTENT_TYPE) {
    return;
  }

  if (
    !contentTypeId ||
    !(await models.StructureEntityTypes.exists({ _id: contentTypeId }))
  ) {
    throw new Error('Choose the structure type these fields belong to');
  }

  if (!groupId) {
    return;
  }

  const group = await models.FieldsGroups.findOne(
    { _id: groupId },
    { contentTypeId: 1 },
  ).lean();

  if (group?.contentTypeId !== contentTypeId) {
    throw new Error('The field group belongs to another structure type');
  }
};
