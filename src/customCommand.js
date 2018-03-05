import { connect, disconnect } from './db/connection';
import { Fields, FieldsGroups } from './db/models';
import { FIELDS_GROUPS_CONTENT_TYPES, FIELD_CONTENT_TYPES } from './data/constants';

export const customCommand = async () => {
  connect();

  const updateGroup = async (fieldType, fieldGroupType) => {
    const groupObj = await FieldsGroups.createGroup({
      name: 'Unassorted properties',
      description: 'Unassorted properties',
      contentType: fieldGroupType,
    });

    await Fields.updateMany(
      { contentType: fieldType },
      { groupId: groupObj._id, isVisible: true, isDefinedByErxes: false },
    );
  };

  await updateGroup(FIELD_CONTENT_TYPES.CUSTOMER, FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER);
  await updateGroup(FIELD_CONTENT_TYPES.COMPANY, FIELDS_GROUPS_CONTENT_TYPES.COMPANY);

  disconnect();
};

customCommand();
