import { getJobExecutionFilter } from '../jobExecutionFilters';

test('empty and whitespace filters do not constrain executions', () => {
  expect(
    getJobExecutionFilter({
      searchValue: ' ',
      jobName: ' ',
      jobId: ' ',
      inputProductId: ' ',
      laborCostName: ' ',
    }),
  ).toEqual({});
});

test('job ids are exact and job/cost names are escaped case-insensitive saved-actual matches', () => {
  const filter = getJobExecutionFilter({
    jobId: ' job-1 ',
    jobName: ' A.B ',
    laborCostName: ' labour+ ',
    overheadCostName: '(power)',
  });
  expect(filter).toEqual({
    'jobs.jobName': { $regex: 'A\\.B', $options: 'i' },
    'jobs.jobId': 'job-1',
    'jobs.laborCosts.name': { $regex: 'labour\\+', $options: 'i' },
    'jobs.overheadCosts.name': { $regex: '\\(power\\)', $options: 'i' },
  });
});

test('both products, search and independent side locations combine without overwriting each other', () => {
  expect(
    getJobExecutionFilter({
      searchValue: 'pack',
      status: 'posted',
      inputProductId: 'raw',
      outputProductId: 'finished',
      inputAccountId: 'in-account',
      inputBranchId: 'in-branch',
      inputDepartmentId: 'in-dept',
      outputAccountId: 'out-account',
      outputBranchId: 'out-branch',
      outputDepartmentId: 'out-dept',
    }),
  ).toEqual({
    status: 'posted',
    inputAccountId: 'in-account',
    inputBranchId: 'in-branch',
    inputDepartmentId: 'in-dept',
    outputAccountId: 'out-account',
    outputBranchId: 'out-branch',
    outputDepartmentId: 'out-dept',
    $or: ['jobs.jobName', 'description'].map((key) => ({
      [key]: { $regex: 'pack', $options: 'i' },
    })),
    'jobs.inputs.productId': 'raw',
    'jobs.outputs.productId': 'finished',
  });
});
