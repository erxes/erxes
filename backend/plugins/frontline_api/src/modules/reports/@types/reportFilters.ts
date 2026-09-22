export type IReportFilters = {
  date?: string;
  fromDate?: string;
  channelIds?: string[];
  memberIds?: string[];
  toDate?: string;
  limit?: number;
  status?: string;
  statusIds?: string[];
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
  pageIds?: string[];
  searchValue?: string;
  propertyIds?: string[];
  groupPropertyId?: string;
  groupPropertyValue?: string;
  propertyValueFilters?: Array<{
    propertyId?: string;
    type?: string;
    values?: string[];
  }>;
};

export type IReportTagsFilters = {
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  source?: string;
  limit?: number;
};

export type IFacebookReportFilters = {
  date?: string;
  fromDate?: string;
  toDate?: string;
  pageIds?: string[];
  searchValue?: string;
  limit?: number;
  page?: number;
};
