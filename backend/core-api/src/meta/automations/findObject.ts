import {
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  buildFindObjectResult,
  CORE_FIND_OBJECT_TARGETS,
} from './findObjectTargets';

type TFindObjectData =
  TAutomationProducersInput[TAutomationProducers.FIND_OBJECT];

export const findObject = async (models: IModels, data: TFindObjectData) => {
  const { objectType, field, value, newest } = data;
  const target = CORE_FIND_OBJECT_TARGETS[objectType];

  if (!target) {
    throw new Error(`Unsupported find object type: ${objectType}`);
  }

  const filter = target.generateFilter(field, value);

  if (!filter) {
    throw new Error(
      `Unsupported lookup field "${field}" for "${target.label}"`,
    );
  }

  const doc = await target
    .getCollection(models)
    .findOne(
      filter,
      target.projection,
      newest ? { sort: { createdAt: -1 } } : undefined,
    )
    .lean();

  return buildFindObjectResult({
    objectType,
    field,
    value,
    doc: doc && target.toObject ? await target.toObject(models, doc) : doc,
  });
};
