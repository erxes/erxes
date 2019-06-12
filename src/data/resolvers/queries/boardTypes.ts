export interface IDate {
  month: number;
  year: number;
}

export interface IListParams {
  pipelineId?: string;
  stageId: string;
  skip?: number;
  date?: IDate;
  search?: string;
  customerIds?: [string];
  companyIds?: [string];
  assignedUserIds?: [string];
}
