export const MnConfigCodes = [
  // ebarimt:
  'EBARIMT',
  'stageInEbarimt',
  'posInEbarimt',
  'returnStageInEbarimt',
  // productPlaces:
  'dealsProductsDataPrint',
  'dealsProductsDataSplit',
  'dealsProductsDataPlaces',
  'dealsProductsDefaultFilter',
  'dealsSplitConfig',
  'dealsPrintConfig',
  // exchangeRate
  // msDynamic:
  'DYNAMIC',
  // syncerkhet:
  'ERKHET',
  'ebarimtConfig',
  'returnEbarimtConfig',
  'posOrderErkhetConfig',
  'stageInMoveConfig',
  'stageInIncomeConfig',
  'remainderConfig',
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
