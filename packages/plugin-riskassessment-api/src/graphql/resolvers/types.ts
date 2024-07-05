export type RiskAssessmentGroupParams = {
  cardId: string;
  cardType: string;
  riskAssessmentId: string;
  groupIds: string[];
};
export type CardValues = {
  value?: any;
  values: any[];
};
export type CardValue = {
  value: any;
  values?: any[];
  
};
export type CardFilter = {
  name: string;
  regex?: boolean;
  operator?: string;
} & (CardValues | CardValue);

export type CardType = 'task' | 'ticket' | 'deal';
