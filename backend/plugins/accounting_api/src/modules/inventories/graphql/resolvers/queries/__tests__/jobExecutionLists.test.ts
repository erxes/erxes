import { IContext } from '~/connectionResolvers';
import { jobExecutionQueries } from '../jobExecutions';
import { getJobExecutionFilter } from '../../../../utils/jobExecutionFilters';

const setup = () => {
  const lean = jest.fn().mockResolvedValue([{ _id: 'execution' }]);
  const limit = jest.fn().mockReturnValue({ lean });
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });
  const find = jest.fn().mockReturnValue({ sort });
  const countDocuments = jest.fn().mockResolvedValue(21);
  const checkPermission = jest.fn().mockResolvedValue(undefined);
  const context = {
    models: { JobExecutions: { find, countDocuments } },
    checkPermission,
  } as unknown as IContext;
  return { context, find, countDocuments, checkPermission, skip, limit };
};

test('list and count share all filters before paging and normalize the returned rows', async () => {
  const { context, find, countDocuments, skip, limit } = setup();
  const params = {
    jobId: 'job',
    jobName: 'saved',
    inputProductId: 'raw',
    outputProductId: 'finished',
    laborCostName: 'work',
    overheadCostName: 'power',
    inputAccountId: 'ia',
    outputBranchId: 'ob',
    page: 2,
    perPage: 20,
  };
  await expect(
    jobExecutionQueries.jobExecutions(undefined, params, context),
  ).resolves.toEqual({ rows: [{ _id: 'execution' }], totalCount: 21 });
  expect(find).toHaveBeenCalledWith(getJobExecutionFilter(params));
  expect(countDocuments).toHaveBeenCalledWith(getJobExecutionFilter(params));
  expect(skip).toHaveBeenCalledWith(20);
  expect(limit).toHaveBeenCalledWith(20);
});

test('read permission is checked before either list or count accesses tenant data', async () => {
  const { context, find, countDocuments, checkPermission } = setup();
  checkPermission.mockRejectedValue(new Error('Denied'));
  await expect(
    jobExecutionQueries.jobExecutions(undefined, {}, context),
  ).rejects.toThrow('Denied');
  expect(find).not.toHaveBeenCalled();
  expect(countDocuments).not.toHaveBeenCalled();
});
