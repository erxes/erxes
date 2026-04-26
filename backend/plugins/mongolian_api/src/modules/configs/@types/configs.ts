export const MnConfigCodes = [
  'EBARIMT',
  'remainderConfig',
  'stageInEbarimt',
  'returnEbarimtConfig',
  'posInEbarimt',
  'ebarimtConfig',
  'returnStageInEbarimt',
  'ERKHET',
  'stageInMoveConfig',
  'dealsProductsDataPrint',
  'dealsProductsDataSplit',
  'dealsProductsDataPlaces',
  'stageInIncomeConfig',
  'dealsProductsDefaultFilter',
  'DYNAMIC',
  'dealsSplitConfig',
  'dealsPrintConfig',
];

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
