import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

// Mongoose schemas ===========

export const configSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { // type
      type: String,
      label: 'Code',
      index: true,
      unique: false
    },
    subId: {
      type: String,
      label: 'Sub ID',
      default: '',
    },
    value: {
      type: Object,
      label: 'Value',
    },
  })
);

configSchema.index({ code: 1, subId: 1 }, { unique: true });


// VAT_RULE: string; '' = bagtsan, 'add' = undsen unedeer nemj tootsoh,
// MainCurrency: string; main currency in country
// 
