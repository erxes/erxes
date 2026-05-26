export interface IDealReportFilter {
  fromDate?: string;
  toDate?: string;
  dateRange?: string;        // 'today','thisWeek', etc.
  dateRangeType?: string;    // 'createdAt','closeDate', etc.
  frequency?: string;        // 'day','week','month','year'
  pipelineIds?: string[];
  stageIds?: string[];
  boardId?: string;
  userIds?: string[];
  assignedUserIds?: string[];
  tagIds?: string[];
  labelIds?: string[];
  companyIds?: string[];
  customerIds?: string[];
  productIds?: string[];
  priority?: string;
  status?: string;
  branchIds?: string[];
  departmentIds?: string[];
  fieldId?: string;          // for custom properties report
  // add any other filter fields you need
}