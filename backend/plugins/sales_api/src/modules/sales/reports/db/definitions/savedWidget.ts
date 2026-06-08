import { Schema, Document } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { ISavedWidget as ISavedWidgetType } from '~/modules/sales/reports/@types/reportFilters';

export interface ISavedWidget extends Document, ISavedWidgetType {}

export const savedWidgetSchema = schemaWrapper(
  new Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    chartType: { type: String, required: true },
    filters: { type: Object, default: {} },
    position: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }),
);
