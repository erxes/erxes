import {
  getCustomRecordType,
  getDataExtensionRecordType,
  getDataExtensionSchemaVersion,
  IDataExtensionFieldCreateInput,
  IDataExtensionFieldEditInput,
  IDataExtensionObjectCreateInput,
  IDataExtensionObjectDocument,
  IDataExtensionObjectEditInput,
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
import {
  addDataExtensionObject,
  deleteDataExtensionObject,
  editDataExtensionObject,
  listDataExtensionObjects,
  setDataExtensionObjectStatus,
  withCustomRecordTypes,
} from '@/data-extensions/objects';
import {
  addDataExtensionView,
  deleteDataExtensionView,
  editDataExtensionView,
  IDataExtensionView,
  listDataExtensionViews,
} from '@/data-extensions/views';

const canReadAll = async (checkPermission: IContext['checkPermission']) => {
  try {
    await checkPermission('dataExtensionsRead');
    return true;
  } catch {
    return false;
  }
};

/** Custom objects are per tenant, so every resolver sees this tenant's. */
const scoped =
  <A, R>(resolve: (args: A, context: IContext) => Promise<R>) =>
  (_parent: undefined, args: A, context: IContext) =>
    withCustomRecordTypes(context.models, () => resolve(args, context));

const withRecordType = (object: IDataExtensionObjectDocument | null) =>
  object && { ...object, recordType: getCustomRecordType(object.key) };

const canManage = async (checkPermission: IContext['checkPermission']) => {
  try {
    await checkPermission('dataExtensionsManage');
    return true;
  } catch {
    return false;
  }
};

/** Views are for people who can read the record type they show. */
const requireRecordRead = async (
  recordType: string | undefined,
  checkPermission: IContext['checkPermission'],
) => {
  const descriptor = recordType ? getDataExtensionRecordType(recordType) : undefined;

  await checkPermission(descriptor?.readAction || 'dataExtensionsRead');
};

export const dataExtensionQueries = {
  /**
   * The registry is static plus this tenant's custom objects. Modules that
   * show extension fields on their own screens need it for relation
   * targets, so any signed-in user may list it; field counts are only for
   * Data Extensions readers.
   */
  dataExtensionRecordTypes: scoped(
    async (_args: undefined, { models, user, checkPermission }) => {
      if (await canReadAll(checkPermission)) {
        return listDataExtensionRecordTypes(models);
      }

      if (!user) {
        await checkPermission('dataExtensionsRead');
      }

      return (await listDataExtensionRecordTypes(models)).map(
        (recordType) => ({ ...recordType, fieldCount: 0 }),
      );
    },
  ),

  /**
   * Definitions of one record type are readable by anyone who can read that
   * record type, so its module can render the fields. Listing every record
   * type, or archived fields, needs the Data Extensions read permission.
   */
  dataExtensionFields: scoped(
    async (
      args: { recordType?: string; includeArchived?: boolean },
      { models, checkPermission },
    ) => {
      if (!(await canReadAll(checkPermission))) {
        const descriptor =
          args.recordType && !args.includeArchived
            ? getDataExtensionRecordType(args.recordType)
            : undefined;

        await checkPermission(descriptor?.readAction || 'dataExtensionsRead');
      }

      return listDataExtensionFields(models, args);
    },
  ),

  async dataExtensionSchemaVersion(
    _parent: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsRead');

    return getDataExtensionSchemaVersion(models);
  },

  async dataExtensionObjects(
    _parent: undefined,
    { includeArchived }: { includeArchived?: boolean },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsRead');

    return (await listDataExtensionObjects(models, includeArchived)).map(
      withRecordType,
    );
  },

  dataExtensionViews: scoped(
    async (
      { recordType }: { recordType: string },
      { models, user, checkPermission },
    ) => {
      await requireRecordRead(recordType, checkPermission);

      return listDataExtensionViews(models, recordType, user._id);
    },
  ),
};


export const dataExtensionMutations = {
  dataExtensionViewAdd: scoped(
    async (
      { input }: { input: Partial<IDataExtensionView> },
      { models, user, checkPermission },
    ) => {
      await requireRecordRead(input.recordType, checkPermission);

      return addDataExtensionView(
        models,
        input,
        user._id,
        await canManage(checkPermission),
      );
    },
  ),

  dataExtensionViewEdit: scoped(
    async (
      { _id, input }: { _id: string; input: Partial<IDataExtensionView> },
      { models, user, checkPermission },
    ) =>
      editDataExtensionView(
        models,
        _id,
        input,
        user._id,
        await canManage(checkPermission),
      ),
  ),

  dataExtensionViewDelete: scoped(
    async ({ _id }: { _id: string }, { models, user, checkPermission }) =>
      deleteDataExtensionView(
        models,
        _id,
        user._id,
        await canManage(checkPermission),
      ),
  ),

  dataExtensionFieldAdd: scoped(
    async (
      { input }: { input: IDataExtensionFieldCreateInput },
      { models, user, checkPermission },
    ) => {
      await checkPermission('dataExtensionsManage');

      return addDataExtensionField(models, input, user._id);
    },
  ),

  dataExtensionRelationAdd: scoped(
    async (
      { input }: { input: IDataExtensionRelationCreateInput },
      { models, user, checkPermission },
    ) => {
      await checkPermission('dataExtensionsManage');

      return addDataExtensionRelation(models, input, user._id);
    },
  ),

  dataExtensionFieldEdit: scoped(
    async (
      { _id, input }: { _id: string; input: IDataExtensionFieldEditInput },
      { models, user, checkPermission },
    ) => {
      await checkPermission('dataExtensionsManage');

      return editDataExtensionField(models, _id, input, user._id);
    },
  ),

  dataExtensionFieldDelete: scoped(
    async (
      { _id }: { _id: string },
      { models, subdomain, user, checkPermission },
    ) => {
      await checkPermission('dataExtensionsManage');

      return deleteDataExtensionField(models, subdomain, _id, user._id);
    },
  ),

  dataExtensionFieldArchive: scoped(
    async ({ _id }: { _id: string }, { models, user, checkPermission }) => {
      await checkPermission('dataExtensionsManage');

      return archiveDataExtensionField(models, _id, user._id);
    },
  ),

  dataExtensionFieldRestore: scoped(
    async ({ _id }: { _id: string }, { models, user, checkPermission }) => {
      await checkPermission('dataExtensionsManage');

      return restoreDataExtensionField(models, _id, user._id);
    },
  ),

  async dataExtensionObjectAdd(
    _parent: undefined,
    { input }: { input: IDataExtensionObjectCreateInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return withRecordType(await addDataExtensionObject(models, input, user._id));
  },

  async dataExtensionObjectEdit(
    _parent: undefined,
    { _id, input }: { _id: string; input: IDataExtensionObjectEditInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return withRecordType(
      await editDataExtensionObject(models, _id, input, user._id),
    );
  },

  async dataExtensionObjectArchive(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return withRecordType(
      await setDataExtensionObjectStatus(models, _id, 'archived', user._id),
    );
  },

  async dataExtensionObjectRestore(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dataExtensionsManage');

    return withRecordType(
      await setDataExtensionObjectStatus(models, _id, 'active', user._id),
    );
  },

  dataExtensionObjectDelete: scoped(
    async (
      { _id }: { _id: string },
      { models, subdomain, user, checkPermission },
    ) => {
      await checkPermission('dataExtensionsManage');

      return deleteDataExtensionObject(models, _id, (fieldId) =>
        deleteDataExtensionField(models, subdomain, fieldId, user._id),
      );
    },
  ),
};
