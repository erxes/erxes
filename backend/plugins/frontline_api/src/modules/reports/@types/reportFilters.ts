export type IReportFilters = {
  date?: string;
  fromDate?: string;
  channelIds?: string[];
  memberIds?: string[];
  toDate?: string;
  limit?: number;
  status?: string;
  source?: string;
  callStatus?: string;
  page?: number;
  pipelineIds?: string[];
  tagIds?: string[];
  state?: string;
  priority?: number[];
  startDate?: string;
  targetDate?: string;
  companyIds?: string[];
  customerIds?: string[];
  frequency?: string;
  branchIds?: string[];
};

export type IReportTagsFilters = {
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  source?: string;
  limit?: number;
};
