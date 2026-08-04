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
  const { objectType, field, value } = data;
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

  const doc = await target.getCollection(models).findOne(filter).lean();

  return buildFindObjectResult({
    objectType,
    field,
    value,
    doc,
  });
};
