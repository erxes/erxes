export const MnConfigCodes = [
  'EBARIMT',
  'remainderConfig',
  'stageInEbarimt',
  'returnEbarimtConfig',
  'ebarimtConfig',
  'returnStageInEbarimt',
  'ERKHET',
  'stageInMoveConfig',
  'dealsProductsDataPrint',
  'dealsProductsDataSplit',
  'dealsProductsDataPlaces',
  'stageInIncomeConfig',
  'dealsProductsDefaultFilter',
]

export interface IConfig {
  code: string;
  subId?: string;
  value: any;
}

export interface IConfigDocument {
  _id: string;
  code: string;
  subId?: string;
  value: any;
}
