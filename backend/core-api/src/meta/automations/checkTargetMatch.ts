import {
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

type TCheckTargetMatchData =
  TAutomationProducersInput[TAutomationProducers.CHECK_TARGET_MATCH];

export const checkTargetMatch = async (
  models: IModels,
  data: TCheckTargetMatchData,
) => {
  const { moduleName, collectionType, targetId, selector } = data;

  if (
    moduleName === 'contacts' &&
    ['customers', 'leads'].includes(collectionType)
  ) {
    return Boolean(
      await models.Customers.exists({
        $and: [{ _id: targetId }, { status: { $ne: 'deleted' } }, selector],
      }),
    );
  }

  if (moduleName === 'contacts' && collectionType === 'companies') {
    return Boolean(
      await models.Companies.exists({
        $and: [{ _id: targetId }, selector],
      }),
    );
  }

  if (moduleName === 'organization' && collectionType === 'users') {
    return Boolean(
      await models.Users.exists({
        $and: [{ _id: targetId }, selector],
      }),
    );
  }

  return false;
};
