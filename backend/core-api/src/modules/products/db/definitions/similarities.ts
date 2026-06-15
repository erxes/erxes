import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { PRODUCT_SIMILARITY_STATUSES } from '../../constants';

const infoSchema = new Schema(
  {
    name: { type: String, optional: true, label: 'Name' },
    shortName: { type: String, optional: true, label: 'Short name' },
    code: { type: String, label: 'Base code' },
    categoryId: { type: String, optional: true, label: 'Category' },
    type: { type: String, optional: true, label: 'Type' },
    description: { type: String, optional: true, label: 'Description' },
    unitPrice: { type: Number, optional: true, label: 'Unit price' },
    currency: { type: String, optional: true, label: 'Currency' },
    uom: { type: String, optional: true, label: 'Main unit of measurement' },
    subUoms: { type: Object, optional: true },
    vendorId: { type: String, optional: true, label: 'Vendor' },
    scopeBrandIds: { type: [String], optional: true },
    barcodeDescription: { type: String, optional: true },
    attachment: { type: attachmentSchema },
    attachmentMore: { type: [attachmentSchema] },
    pdfAttachment: { type: Object, optional: true },
  },
  { _id: false },
);

export const productSimilaritySchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      status: {
        type: String,
        enum: PRODUCT_SIMILARITY_STATUSES.ALL,
        default: PRODUCT_SIMILARITY_STATUSES.ACTIVE,
        label: 'Status',
        index: true,
      },
      info: { type: infoSchema, label: 'Base info' },
      propertiesData: {
        type: Schema.Types.Mixed,
        label: 'Selected properties',
      },
      productIds: { type: [String], default: [], label: 'Product ids' },
      starProductId: { type: String, optional: true, label: 'Star product' },
    },
    {
      timestamps: true,
    },
  ),
);
