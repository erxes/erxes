import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const safeRemainderSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    branchId: { type: String, default: '', label: 'Branch' },
    departmentId: { type: String, default: '', label: 'Department' },
    productCategoryId: {
      type: String,
      optional: true,
      label: 'Product Category',
    },
    attachment: { type: attachmentSchema, optional: true },
    filterField: { type: String, optional: true },
    date: { type: Date, label: 'Date' },
    description: { type: String, label: 'Description' },
    status: { type: String, label: 'Status' },

    // Тооллогоос үндсэн бичилтүүдийг л гаргаж өгнө, холбоос байна, тухайн гүйлээ рүү нь ороод нябо өөрөө харьцсан гүйлгээ болон бусад тохиргоо магадгүй НӨАТ зэргийг тодорхойлно
    incomeRule: { type: Object, optional: true },
    incomeTrId: { type: String, optional: true },
    outRule: { type: Object, optional: true },
    outTrId: { type: String, optional: true },
    saleRule: { type: Object, optional: true },
    saleTrId: { type: String, optional: true },

    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' },
  }),
);
