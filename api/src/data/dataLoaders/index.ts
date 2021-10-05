import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ICompanyDocument } from '../../db/models/definitions/companies';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';
import { ITagDocument } from '../../db/models/definitions/tags';
import { IFormDocument } from '../../db/models/definitions/forms';
import { IIntegrationDocument } from '../../db/models/definitions/integrations';
import { IUserDocument } from '../../db/models/definitions/users';
import { ISegmentDocument } from '../../db/models/definitions/segments';
import productCategory from './productCategory';
import tag from './tag';
import company from './company';
import form from './form';
import integration from './integration';
import user from './user';
import segmentsBySubOf from './segmentsBySubOf';
import segment from './segment';
import { ICustomer } from '../../db/models/definitions/customers';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../../db/models/definitions/conversations';
import customer from './customer';
import conversationMessagesByConversationId from './conversationMessagesByConversationId';
import conversationsByCustomerId from './conversationsByCustomerId';

export interface IDataLoaders {
  productCategory: DataLoader<string, IProductCategoryDocument>;
  tag: DataLoader<string, ITagDocument>;
  company: DataLoader<string, ICompanyDocument>;
  form: DataLoader<string, IFormDocument>;
  integration: DataLoader<string, IIntegrationDocument>;
  user: DataLoader<string, IUserDocument>;
  segmentsBySubOf: DataLoader<string, ISegmentDocument[]>;
  segment: DataLoader<string, ISegmentDocument>;
  customer: DataLoader<string, ICustomer>;
  conversationMessagesByConversationId: DataLoader<string, IMessageDocument[]>;
  conversationsByCustomerId: DataLoader<string, IConversationDocument[]>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    company: company(),
    form: form(),
    integration: integration(),
    user: user(),
    segmentsBySubOf: segmentsBySubOf(),
    segment: segment(),
    customer: customer(),
    conversationMessagesByConversationId: conversationMessagesByConversationId(),
    conversationsByCustomerId: conversationsByCustomerId()
  };
}
