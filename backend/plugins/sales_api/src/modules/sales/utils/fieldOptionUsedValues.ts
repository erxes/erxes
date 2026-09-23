import {
  getFieldOptionUsedValuesFromModel,
  IFieldOptionUsageCount,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const getDealFieldOptionUsedValues = (
  models: IModels,
  fieldId: string,
  values: string[],
): Promise<IFieldOptionUsageCount[]> =>
  getFieldOptionUsedValuesFromModel(models.Deals, fieldId, values);
