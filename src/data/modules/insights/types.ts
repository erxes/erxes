import * as moment from 'moment';

export interface IMessageSelector {
  userId?: string;
  createdAt?: { $gte: Date; $lte: Date };
  fromBot?: { $exists: boolean };
  conversationId?: {
    $in: string[];
  };
}

export interface IGenerateChartData {
  x: any;
  y: number;
}

export interface IGeneratePunchCard {
  day: number;
  hour: number;
  date: number;
  count: number;
}

export interface IGenerateTimeIntervals {
  title: string;
  start: moment.Moment;
  end: moment.Moment;
}

export interface IGenerateUserChartData {
  fullName?: string;
  avatar?: string;
  graph: IGenerateChartData[];
}

export interface IFixDates {
  start: Date;
  end: Date;
}

export interface IResponseUserData {
  [index: string]: {
    responseTime: number;
    count: number;
    summaries?: number[];
  };
}

export interface IGenerateResponseData {
  trend: IGenerateChartData[];
  time: number;
  teamMembers: {
    data: IGenerateUserChartData[];
  };
}

export interface IListArgs {
  integrationIds: string;
  brandIds: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface IDealListArgs {
  pipelineIds: string;
  boardId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface IFilterSelector {
  createdAt?: { $gte: Date; $lte: Date };
  integration: {
    kind?: { $in: string[] };
    brandId?: { $in: string[] };
  };
}

export interface IDealSelector {
  modifiedAt?: {
    $gte: Date;
    $lte: Date;
  };
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
  stageId?: object;
}

export interface IStageSelector {
  probability?: string;
  pipelineId?: {};
}

export interface IPieChartData {
  id: string;
  label: string;
  value: number;
}

export interface IVolumeReportExportArgs {
  date: string;
  count: number;
  customerCount: number;
  customerCountPercentage: string;
  messageCount: number;
  resolvedCount: number;
  averageResponseDuration: string;
  firstResponseDuration: string;
}

export interface IAddCellArgs {
  sheet: any;
  cols: string[];
  rowIndex: number;
  col: string;
  value: string | number;
}

export interface IListArgsWithUserId extends IListArgs {
  userId?: string;
}

export interface IGenerateMessage {
  args: IListArgs;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}

export interface IResponseFirstResponseExport {
  intervals: any[];
  title: string;
  _id: string;
}
