import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument } from '~/utils';

enum AgentStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived',
}

export interface IAgent {
  number: string;
  customerIds: string[];
  companyIds: string[];
  status: AgentStatus;
  startDate?: Date;
  endDate?: Date;
  startMonth?: Date;
  endMonth?: Date;
  startDay?: Date;
  endDay?: Date;
  hasReturn: boolean;
  productRuleIds?: string[];
  returnAmount?: number;
  returnPercent?: number;
  prepaidPercent?: number;
  discountPercent?: number;
}

export interface IAgentDocument extends IAgent, ICommonDocument, Document {
  _id: string;
}

export interface IAgentParams extends ICursorPaginateParams {
  number?: string;
  status?: string;
  hasReturn?: boolean;
  customerIds?: string[];
  companyIds?: string[];
}
