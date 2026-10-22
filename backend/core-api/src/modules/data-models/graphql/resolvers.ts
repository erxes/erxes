import type {
  IDataModel,
  IDataModelList,
  IDataModelListParams,
} from '../types';
import type { DataModelCreateInput, DataModelUpdateInput } from '../validation';
import { authorizeDataModel as authorize } from './context';
import type { DataModelContext } from './context';
import { getDataModelFieldModel } from '../fields/registry';

export interface DataModelVersionArgs {
  _id: string;
  expectedVersion: number;
}

export const dataModelQueries = {
  dataModelList: async (
    _root: unknown,
    params: Partial<IDataModelListParams>,
    context: DataModelContext,
  ): Promise<IDataModelList> => {
    const { registry } = await authorize(context, 'dataModelsRead');
    return registry.list(params);
  },
  dataModelDetail: async (
    _root: unknown,
    { _id }: { _id: string },
    context: DataModelContext,
  ): Promise<IDataModel> => {
    const { registry } = await authorize(context, 'dataModelsRead');
    return registry.get(_id);
  },
};

export const dataModelMutations = {
  dataModelCreate: async (
    _root: unknown,
    { input }: { input: DataModelCreateInput },
    context: DataModelContext,
  ): Promise<IDataModel> => {
    const { registry, actorId } = await authorize(context, 'dataModelsManage');
    return registry.create(input, actorId);
  },
  dataModelUpdate: async (
    _root: unknown,
    {
      _id,
      input,
      expectedVersion,
    }: DataModelVersionArgs & { input: DataModelUpdateInput },
    context: DataModelContext,
  ): Promise<IDataModel> => {
    const { registry, actorId } = await authorize(context, 'dataModelsManage');
    return registry.update(_id, input, expectedVersion, actorId);
  },
  dataModelArchive: async (
    _root: unknown,
    { _id, expectedVersion }: DataModelVersionArgs,
    context: DataModelContext,
  ): Promise<IDataModel> => {
    const { registry, actorId } = await authorize(context, 'dataModelsManage');
    const model = await registry.get(_id);
    if (
      model.source === 'CUSTOM' &&
      (await getDataModelFieldModel(
        context.models.DataModelDefinitions.db,
      ).exists({
        archivedAt: null,
        type: 'relation',
        $or: [{ dataModelId: _id }, { 'relation.targetModelId': _id }],
      }))
    )
      throw new Error(
        'Archive this model’s relations before archiving the model',
      );
    return registry.archive(_id, expectedVersion, actorId);
  },
  dataModelRestore: async (
    _root: unknown,
    { _id, expectedVersion }: DataModelVersionArgs,
    context: DataModelContext,
  ): Promise<IDataModel> => {
    const { registry, actorId } = await authorize(context, 'dataModelsManage');
    return registry.restore(_id, expectedVersion, actorId);
  },
};
