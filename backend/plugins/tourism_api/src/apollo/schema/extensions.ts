import {
  graphqlAttachmentInput,
  graphqlAttachmentType,
  graphqlPdfAttachmentInput,
  graphqlPdfAttachmentType,
} from 'erxes-api-shared/src/utils/apollo/commonTypeDefs';

export const TypeExtensions = `
    extend type User @key(fields: "_id") {
      _id: String! @external
    }
  `;

// ${graphqlAttachmentType}
// ${graphqlAttachmentInput}
// ${graphqlPdfAttachmentType}
// ${graphqlPdfAttachmentInput}
