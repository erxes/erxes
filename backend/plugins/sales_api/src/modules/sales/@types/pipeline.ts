import { Document } from 'mongoose';

export interface IPipeline {
  name?: string;
  boardId: string;
  status?: string;
  visibility?: string;
  memberIds?: string[];
  bgColor?: string;
  watchedUserIds?: string[];
  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
  isCheckDate?: boolean;
  isCheckUser?: boolean;
  isCheckDepartment?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
  nameConfig?: string;
  lastNum?: string;
  departmentIds?: string[];
  branchIds?: string[];
  tagId?: string;
  initialCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;

  userId?: string;
  order?: number;
  type: string;
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
  createdAt?: Date;
}
