import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ICustomer } from '../../db/models/definitions/customers';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';

import { IDataLoaders } from './index'
import customer from './customer';
import message from './message';

export interface IConversationLoader extends IDataLoaders {
  customer?: DataLoader<string, ICustomer>;
  message?: DataLoader<string, IMessageDocument>;
}

export function genAllConversationLoader(): IConversationLoader {
  return {
    customer: customer(),
    message: message()
  };
}
