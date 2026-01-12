import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IDonate {
  ownerId: string;
  ownerType: string;

  campaignId: string;

  donateScore: number;

  awardId: string;
  voucherId: string;

  conditions: Record<string, any>;
}

export interface IDonateDocument extends IDonate, Document {
  createdBy: string;
  updatedBy: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IDonateListParams extends ICursorPaginateParams {
  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
  awardId?: string;
}
