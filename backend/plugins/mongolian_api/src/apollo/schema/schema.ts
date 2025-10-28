import {
  UserType,
  ProductType,
  AutomationResponseType,
  PutResponseType,
} from '@/ebarimt/graphql/schema/ebarimt';

import { EbarimtProductGroupType } from '@/ebarimt/graphql/schema/productGroup';
import { EbarimtProductRuleType } from '@/ebarimt/graphql/schema/productRule';


export const types = `
  ${UserType}
  ${ProductType}
  ${AutomationResponseType}
  ${PutResponseType}
  ${EbarimtProductGroupType}
  ${EbarimtProductRuleType}
`;

export const queries = `

`;

export const mutations = `

`;

export default { types, queries, mutations };
