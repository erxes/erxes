import { FilterQuery } from 'mongoose';
import { escapeRegExp } from 'erxes-api-shared/utils';
import {
  IJobExecutionDocument,
  IJobExecutionListParams,
} from '../@types/jobExecutions';

export const getJobExecutionFilter = (
  params: IJobExecutionListParams,
): FilterQuery<IJobExecutionDocument> => {
  const filter: FilterQuery<IJobExecutionDocument> = {};
  for (const key of [
    'status',
    'inputAccountId',
    'inputBranchId',
    'inputDepartmentId',
    'outputAccountId',
    'outputBranchId',
    'outputDepartmentId',
  ] as const) {
    if (params[key]?.trim()) filter[key] = params[key]?.trim();
  }
  const regex = (value: string) => ({
    $regex: escapeRegExp(value.trim()),
    $options: 'i',
  });
  const searchValue = params.searchValue?.trim();
  if (searchValue)
    filter.$or = ['jobs.jobName', 'description'].map((path) => ({
      [path]: regex(searchValue),
    }));
  if (params.jobName?.trim()) filter['jobs.jobName'] = regex(params.jobName);
  if (params.jobId?.trim()) filter['jobs.jobId'] = params.jobId.trim();
  for (const [key, path] of [
    ['inputProductId', 'inputs.productId'],
    ['outputProductId', 'outputs.productId'],
  ] as const) {
    if (params[key]?.trim()) filter[`jobs.${path}`] = params[key].trim();
  }
  for (const [key, path] of [
    ['laborCostName', 'laborCosts.name'],
    ['overheadCostName', 'overheadCosts.name'],
  ] as const) {
    if (params[key]?.trim()) filter[`jobs.${path}`] = regex(params[key]);
  }
  return filter;
};
