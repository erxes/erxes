import {
  getDataExtensionRecordType,
  getDataExtensionSchemaVersion,
  IDataExtensionFieldCreateInput,
  IDataExtensionFieldEditInput,
  IDataExtensionRelationCreateInput,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import {
  addDataExtensionField,
  addDataExtensionRelation,
  archiveDataExtensionField,
  deleteDataExtensionField,
  editDataExtensionField,
  listDataExtensionFields,
  listDataExtensionRecordTypes,
  restoreDataExtensionField,
} from '@/data-extensions/fields';

const canReadAll = async (checkPermission: IContext['checkPermission']) => {
  try {
    await checkPermission('dataExtensionsRead');
    return true;
  } catch {
    return false;
  }
};

export const dataExtensionQueries = {
  /**
   * The registry is static. Modules that show extension fields on their own
   * screens need it for relation targets, so any signed-in user may list
   * it; field counts are only for Data Extensions readers.
   */
  async dataExtensionRecordTypes(
    _parent: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) {
    if (await canReadAll(checkPermission)) {
      return listDataExtensionRecordTypes(models);
    }

    if (!user) {
      await checkPermission('dataExtensionsRead');
    }

    return (await listDataExtensionRecordTypes(models)).map((recordType) => ({
      ...recordType,
      fieldCount: 0,
    }));
  },

  /**
   * Definitions of one record type are readable by anyone who can read that
   * record type, so its module can render the fields. Listing every record
   * type, or archived fields, needs the Data Extensions read permission.
   */
  async dataExtensionFields(
    _parent: undefined,
    args: { recordType?: string; includeArchived?: boolean },
    { models, checkPermission }: IContext,
  ) {
    if (!(await canReadAll(checkPermission))) {
      const descriptor =
        args.recordType && !args.includeArchived
          ? getDataExtensionRecordType(args.recordType)
          : undefined;

      await checkPermission(descriptor?.readAction || 'dataExtensionsRead');
    }

    return listDataExtensionFields(models, args);
  },

  async dataExtensionSchemaVersion(
    _parent: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsRead');

    return getDataExtensionSchemaVersion(models);
  },
};

export const dataExtensionMutations = {
  async dataExtensionFieldAdd(
    _parent: undefined,
    { input }: { input: IDataExtensionFieldCreateInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return addDataExtensionField(models, input, user._id);
  },

  async dataExtensionRelationAdd(
    _parent: undefined,
    { input }: { input: IDataExtensionRelationCreateInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return addDataExtensionRelation(models, input, user._id);
  },

  async dataExtensionFieldEdit(
    _parent: undefined,
    { _id, input }: { _id: string; input: IDataExtensionFieldEditInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return editDataExtensionField(models, _id, input, user._id);
  },

  async dataExtensionFieldDelete(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return deleteDataExtensionField(models, subdomain, _id, user._id);
  },

  async dataExtensionFieldArchive(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return archiveDataExtensionField(models, _id, user._id);
  },

  async dataExtensionFieldRestore(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return restoreDataExtensionField(models, _id, user._id);
  },
};
