export const attachmentType = `
  type Attachment {
    url: String!
    name: String
    type: String
    size: Float
    duration: Float
  }
`;

export const attachmentInput = `
  input AttachmentInput {
    url: String!
    name: String!
    type: String
    size: Float
    duration: Float
  }
`;

export const pdfAttachmentType = `
  type PdfAttachment {
    pdf: Attachment
    pages: [Attachment]
  }
`;

export const pdfAttachmentInput = `
  input PdfAttachmentInput {
    pdf: AttachmentInput
    pages: [AttachmentInput]
  }
`;
