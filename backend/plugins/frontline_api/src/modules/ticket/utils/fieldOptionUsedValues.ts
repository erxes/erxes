import {
  getFieldOptionUsedValuesFromModel,
  IFieldOptionUsageCount,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const getTicketFieldOptionUsedValues = (
  models: IModels,
  fieldId: string,
  values: string[],
  groupKey?: string | null,
): Promise<IFieldOptionUsageCount[]> =>
  getFieldOptionUsedValuesFromModel(models.Ticket, fieldId, values, groupKey);
