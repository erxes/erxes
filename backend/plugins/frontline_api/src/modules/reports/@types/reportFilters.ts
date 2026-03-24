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
};

export type IReportTagsFilters = {
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  source?: string;
  limit?: number;
};
