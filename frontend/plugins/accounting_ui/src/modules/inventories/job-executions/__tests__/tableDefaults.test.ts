import { JOB_EXECUTION_COLUMN_ORDER } from '../tableDefaults';

test('execution table source order keeps locations together and selection last', () => {
  expect(JOB_EXECUTION_COLUMN_ORDER).toEqual([
    'more',
    'date',
    'status',
    'inputAccountId',
    'inputBranchId',
    'inputDepartmentId',
    'outputAccountId',
    'outputBranchId',
    'outputDepartmentId',
    'description',
    'jobName',
    'quantity',
    'checkbox',
  ]);
  expect(new Set(JOB_EXECUTION_COLUMN_ORDER).size).toBe(
    JOB_EXECUTION_COLUMN_ORDER.length,
  );
});
