import { Document } from 'mongoose';

export interface IMastraTool {
  toolId: string;
  name: string;
  description?: string;
  type: 'builtin' | 'erxes';
  builtinType?: string;
  erxesPlugin?: string;
  erxesModule?: string;
  erxesOperation?: string;
  erxesOperationType?: 'query' | 'mutation';
  graphqlArgs?: any[];
  erxesReturnType?: any;
  erxesResponseFields?: string;
  isEnabled?: boolean;
}

export interface IMastraToolDocument extends IMastraTool, Document {
  _id: string;
  createdAt: Date;
}
