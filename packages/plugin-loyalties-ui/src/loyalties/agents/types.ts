enum AgentStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived'
};

export interface IAgent {
  status: AgentStatus;
  number: string;
  customerIds: string[];
  companyIds: string[];
  startDate?: Date;
  endDate?: Date;
  startMonth?: Date;
  endMonth?: Date;
  startDay?: Date;
  endDay?: Date;
  hasReturn: boolean;
  returnAmount?: number;
  returnPercent?: number;
  prepaidPercent?: number;
  discountPercent?: number;
  productRuleIds?: string[];
}

export interface IAgentDocument extends IAgent {
  _id: string;
}

// mutation types
export type AddMutationResponse = {
  agentsAdd: (params: { variables: IAgent }) => Promise<any>;
};

export type EditMutationResponse = {
  agentsEdit: (params: { variables: IAgentDocument }) => Promise<any>;
};
