import { IAttachment } from '@erxes/ui/src/types';

export const commonParamDefs = `
  $title: String,
  $description: String,
  $startDate: Date,
  $endDate: Date,
  $finishDateOfUse: Date,
  $attachment: AttachmentInput,
  $status: String,
`;

export const commonParams = `
  title: $title
  description: $description
  startDate: $startDate
  endDate: $endDate
  finishDateOfUse: $finishDateOfUse
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
  finishDateOfUse
  attachment {
    url
    name
    size
    type
  }
  status
`;

export const paginateDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
`;

export const paginateValues = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
`;

export const commonFilterDefs = `
  $searchValue: String,
  $filterStatus: String,
`;

export const commonFilterValues = `
  searchValue: $searchValue,
  filterStatus: $filterStatus,
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
  finishDateOfUse?: Date,
  attachment?: IAttachment,

  status?: string
};