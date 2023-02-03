import { RiskCalculateLogicType } from '../../common/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IIndicatorsGroup {
  indicatorIds: string[];
  percentWeight: number;
  calculateLogics: [RiskCalculateLogicType];
}

export interface IIndicatorsGroups {
  _id: string;
  name: string;
  description: string;
  calculateMethod: string;
  calculateLogics: [RiskCalculateLogicType];
  groups: [IIndicatorsGroup];
  createdAt: string;
  modifiedAt: string;
}

export interface IIndicatorsGroupsQueryResponse extends QueryResponse {
  riskIndicatorsGroups: [IIndicatorsGroups];
  riskIndicatorsGroupsTotalCount: number;
}
