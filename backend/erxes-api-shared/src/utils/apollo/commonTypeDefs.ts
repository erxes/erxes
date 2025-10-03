export const graphqlAttachmentType = `
  type Attachment {
    url: String!
    name: String
    type: String
    size: Float
    duration: Float
  }
`;

export const graphqlAttachmentInput = `
  input AttachmentInput {
    url: String!
    name: String!
    type: String
    size: Float
    duration: Float
  }
`;

export const graphqlPdfAttachmentType = `
  type PdfAttachment {
    pdf: Attachment
    pages: [Attachment]
  }
`;

export const graphqlPdfAttachmentInput = `
  input PdfAttachmentInput {
    pdf: AttachmentInput
    pages: [AttachmentInput]
  }
`;

export const graphqlPaginationInfo = `
  type PageInfo {
    hasNextPage: Boolean,
    hasPreviousPage: Boolean,
    startCursor: String,
    endCursor: String,
  }
`;

export const apolloCommonTypes = `
  scalar Date
  scalar JSON

  enum CURSOR_DIRECTION {
    forward,
    backward
  }

  enum CURSOR_MODE {
    inclusive,
    exclusive
  }

  enum CONTACT_STATUS {
    active,
    deleted
  }

  type Coordinate {
    longitude: String
    latitude: String
  }

  input CoordinateInput {
    longitude: String
    latitude: String
  }

  ${graphqlAttachmentType}
  ${graphqlAttachmentInput}
  ${graphqlPdfAttachmentType}
  ${graphqlPdfAttachmentInput}
  ${graphqlPaginationInfo}
`;
