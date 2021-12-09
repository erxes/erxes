import { IAttachment } from 'erxes-ui/lib/types';

export const commonParamDefs = `
  $title: String,
  $description: String,
  $startDate: Date,
  $endDate: Date,
  $attachment: AttachmentInput,
  $status: String,
`;

export const commonParams = `
  title: $title
  description: $description
  startDate: $startDate
  endDate: $endDate
  attachment: $attachment
  status: $status
`;

export const commonFields = `
  createdAt
  createdBy
  modifiedAt
  modifiedBy
  title
  description
  startDate
  endDate
  attachment {
    url
    name
    size
    type
  }
  status
`;

export type ICommonTypes = {
  _id?: string,
  createdAt?: Date,
  createdBy?: string,
  modifiedAt?: Date,
  modifiedBy?: string,

  title?: string,
  description?: string,
  startDate?: Date,
  endDate?: Date,
  attachment?: IAttachment,

  status?: string
};