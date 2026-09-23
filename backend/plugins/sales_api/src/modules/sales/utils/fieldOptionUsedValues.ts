import {
  getFieldOptionUsedValuesFromModel,
  IFieldOptionUsageCount,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const getDealFieldOptionUsedValues = (
  models: IModels,
  fieldId: string,
  values: string[],
  groupKey?: string | null,
): Promise<IFieldOptionUsageCount[]> =>
  getFieldOptionUsedValuesFromModel(models.Deals, fieldId, values, groupKey);
