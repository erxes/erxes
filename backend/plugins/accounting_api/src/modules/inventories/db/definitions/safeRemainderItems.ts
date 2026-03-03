import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const ITrRuleSchema = {
  accountId: { type: String },
  customerType: { type: String },
  customerId: { type: String },
}


export const safeRemainderItemSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    remainderId: { type: String, index: true },

    productId: { type: String, index: true },

    preCount: { type: Number, label: 'Pre count' },
    count: { type: Number, label: 'Remainder count' },

    status: { type: String, label: 'Status', enum: ['new', 'checked'] },
    uom: { type: String, label: 'UOM' },
    modifiedAt: {
      type: Date,
      default: new Date(),
      label: 'Modified date',
    },
    modifiedBy: { type: String, label: 'Modified User' },
    order: { type: Number, index: true },

    description: { type: String, label: 'Description', optional: true },

    // Тооллогоос үндсэн бичилтүүдийг л гаргаж өгнө, холбоос байна, тухайн гүйлээ рүү нь ороод нябо өөрөө харьцсан гүйлгээ болон бусад тохиргоо магадгүй НӨАТ зэргийг тодорхойлно
    incomeRule: { type: ITrRuleSchema, optional: true },
    incomeTrId: { type: String, optional: true },
    outRule: { type: ITrRuleSchema, optional: true },
    outTrId: { type: String, optional: true },
    saleRule: { type: ITrRuleSchema, optional: true },
    saleTrId: { type: String, optional: true },
  }),
);

// for safeRemainderItemSchema query. increases search speed, avoids in-memory sorting
safeRemainderItemSchema.index({
  remainderId: 1,
  productId: 1,
});
