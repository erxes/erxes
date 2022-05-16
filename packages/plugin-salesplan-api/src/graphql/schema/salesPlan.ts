import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id"){
    _id: String @external
  }

  type SalesLog {
    
  }
  
`;
