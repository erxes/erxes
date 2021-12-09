export const commonTypes = `
  createdAt: Date,
  createdBy: String,
  modifiedAt: Date,
  modifiedBy: String,

  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  attachment: Attachment,

  status: String,
`;

export const commonInputs = `
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  attachment: AttachmentInput,
  status: String,
`;