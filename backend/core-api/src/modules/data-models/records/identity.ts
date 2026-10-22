import { dataModelRecordIdSchema } from './validation';

export const dataModelRecordCollectionName = (modelId: string): string =>
  `data_model_records_${dataModelRecordIdSchema.parse(modelId)}`;
