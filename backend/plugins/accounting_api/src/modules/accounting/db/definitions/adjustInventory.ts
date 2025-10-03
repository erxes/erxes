import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { ADJ_INV_STATUSES } from '../../@types/adjustInventory';

const infoPerDateSchema = new Schema({
  _id: mongooseStringRandomId,
  date: { type: Date, label: 'date' },
  remainder: { type: Number, optional: true, label: 'remainder' },
  cost: { type: Number, optional: true, label: 'cost' },
  unitCost: { type: Number, optional: true, label: 'unitCost' },
  soonInCount: { type: Number, optional: true, label: 'soonInCount' },
  soonOutCount: { type: Number, optional: true, label: 'soonOutCount' },
})

export const adjustInvDetailsSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    adjustId: { type: String, optional: true, label: 'Adjust inventory' },
    productId: { type: String, optional: true, label: 'Product' },
    accountId: { type: String, label: 'account' },
    branchId: { type: String, label: 'branch' },
    departmentId: { type: String, label: 'department' },
    remainder: { type: Number, optional: true, label: 'remainder' },
    cost: { type: Number, optional: true, label: 'cost' },
    unitCost: { type: Number, optional: true, label: 'unitCost' },
    soonInCount: { type: Number, optional: true, label: 'soonInCount' },
    soonOutCount: { type: Number, optional: true, label: 'soonOutCount' },
    error: { type: String, optional: true, label: 'error' },
    warning: { type: String, optional: true, label: 'warning' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },
    infoPerDate: { type: [infoPerDateSchema], defaultValue: [], }
  })
);

adjustInvDetailsSchema.index({
  accountId: 1, branchId: 1, departmentId: 1, productId: 1
})

export const adjustInventoriesSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, label: 'date' }, // хэднээр тасалж өртөг зүгшрүүлж байна вэ? буюу хүртэлх огноо
    description: { type: String, label: 'description' },
    status: { type: String, default: 'draft', enum: ADJ_INV_STATUSES.all, label: 'status' },
    error: { type: String, optional: true, label: 'error' },
    warning: { type: String, optional: true, label: 'warning' },
    beginDate: { type: Date, label: 'date' }, // өмнөх хаалтын огноо эсвэл анхны гүйлгээний огноо
    checkedAt: { type: Date, label: 'date' }, // хамгийн сүүлд шалгасан огноо, modifiedAt ийн түвшнийх буюу системийн огноогоор
    successDate: { type: Date, label: 'current date' }, // хамгийн сүүлийн амжилттай ажилласан огноо, зорилго date тэй тэнцүү байх, tr.date ийн түвшнийх
    createdBy: { type: String, label: 'Created user' },
    modifiedBy: { type: String, optional: true, label: 'Modified user' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' }, // үүссэн огноо
    updatedAt: { type: Date, optional: true, label: 'Modified at' }, // хамгийн сүүлд өөрчилсөн огноо
  }),
);
