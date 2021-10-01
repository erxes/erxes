import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ICompanyDocument } from '../../db/models/definitions/companies';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';
import { ITagDocument } from '../../db/models/definitions/tags';
import { ICustomer } from '../../db/models/definitions/customers';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../../db/models/definitions/conversations';
import productCategory from './productCategory';
import tag from './tag';
import company from './company';
import customer from './customer';
import messageByConvId from './message';
import conversationByCustomerId from './conversation'

export interface IDataLoaders {
  productCategory: DataLoader<string, IProductCategoryDocument>;
  tag: DataLoader<string, ITagDocument>;
  company: DataLoader<string, ICompanyDocument>;
  customer?: DataLoader<string, ICustomer>;
  messageByConvId?: DataLoader<string, IMessageDocument[]>;
  conversationByCustomerId?: DataLoader<string, IConversationDocument[]>
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    company: company(),
    customer: customer(),
    messageByConvId: messageByConvId(),
    conversationByCustomerId: conversationByCustomerId()
  };
}
