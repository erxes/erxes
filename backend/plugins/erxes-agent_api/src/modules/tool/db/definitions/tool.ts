import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const toolSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    toolId: { type: String, required: true, unique: true, label: 'Tool ID' },
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, label: 'Description' },
    type: { type: String, enum: ['builtin', 'erxes'], required: true, label: 'Type' },
    builtinType: { type: String, label: 'Builtin Type' },
    erxesPlugin: { type: String, label: 'erxes Plugin' },
    erxesModule: { type: String, label: 'erxes Module' },
    erxesOperation: { type: String, label: 'erxes Operation' },
    erxesOperationType: { type: String, enum: ['query', 'mutation'], label: 'Operation Type' },
    graphqlArgs: { type: Schema.Types.Mixed, default: [] },
    erxesReturnType: { type: Schema.Types.Mixed, label: 'Return Type' },
    erxesResponseFields: { type: String, default: '_id', label: 'Response Fields' },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);
