import { QueryResponse } from '@erxes/ui/src/types';
import { RiskCalculateLogicType } from '../../common/types';

export interface IIndicatorsGroup {
  indicatorIds: string[];
  percentWeight: number;
  calculateLogics: [RiskCalculateLogicType];
}

export interface IIndicatorsGroups {
  _id: string;
  name: string;
  description: string;
  tagIds: string[];
  calculateMethod: string;
  calculateLogics: [RiskCalculateLogicType];
  groups: [IIndicatorsGroup];
  createdAt: string;
  modifiedAt: string;
  ignoreZeros: boolean;
}

export interface IIndicatorsGroupsQueryResponse extends QueryResponse {
  riskIndicatorsGroups: [IIndicatorsGroups];
  riskIndicatorsGroupsTotalCount: number;
}
