import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

// Mongoose schemas ===========

export const accountingConfigSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { type: String, unique: true },
    value: { type: Object },
  })
);

// VAT_RULE: string; '' = bagtsan, 'add' = undsen unedeer nemj tootsoh,
// MainCurrency: string; main currency in country
// 
