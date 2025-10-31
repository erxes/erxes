import { IAttachment } from 'erxes-ui';

export interface IUser {
  _id: string;
  details: {
    fullName: string;
    avatar: string;
  };
}

export interface ICategory {
  _id: string;
  topicId: string;
  title: string;
  code?: string;
  description?: string;
  icon?: string;
  numOfArticles?: number;
  countArticles?: number;
  authors?: IUser[];
  parentCategoryId?: string;
  children?: ICategory[];
}

export interface ITopic {
  _id: string;
  title: string;
  code: string;
  description: string;
  brandId: string;
  color: string;
  backgroundImage: string;
  languageCode: string;
  notificationSegmentId: string;
  categories?: ICategory[];
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  parentCategories?: ICategory[];
}
export interface ICommonDoc {
  campaignId: string;
  createdAt: Date;
  usedAt: Date;

  ownerType: string;
  ownerId: string;
  voucherCampaignId?: string;
}
export interface ICommonTypes {
  _id?: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  finishDateOfUse?: Date;
  attachment?: IAttachment;

  status?: string;
}
