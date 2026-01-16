import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

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

export interface IAgentDocument extends IAgent, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgentListParams extends ICursorPaginateParams {
  number?: string;
  status?: string;
  hasReturn?: boolean;
  customerIds?: string[];
  companyIds?: string[];
}
