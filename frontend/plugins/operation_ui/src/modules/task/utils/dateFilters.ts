import { parseDateRangeFromString } from 'erxes-ui';

const DATE_RANGE_MAP = {
  startDateStartDate: 'startDateEndDate',
  targetDateStartDate: 'targetDateEndDate',
  createdStartDate: 'createdEndDate',
  updatedStartDate: 'updatedEndDate',
  completedStartDate: 'completedEndDate',
} as const;

type TaskDateKey = keyof typeof DATE_RANGE_MAP;
type TaskDateBoundKey = TaskDateKey | (typeof DATE_RANGE_MAP)[TaskDateKey];
type TaskDateVariables = Partial<Record<TaskDateBoundKey, string>>;

export const TASK_DATE_RANGE_KEYS = [
  ...Object.keys(DATE_RANGE_MAP),
  ...Object.values(DATE_RANGE_MAP),
];

export const getTaskDateFilterVariables = (
  values: Partial<Record<TaskDateKey, string | null>>,
): TaskDateVariables => {
  const variables: TaskDateVariables = {};

  for (const key of Object.keys(DATE_RANGE_MAP) as TaskDateKey[]) {
    const value = values[key];
    if (!value) continue;

    const range = parseDateRangeFromString(value);
    if (
      range &&
      !Number.isNaN(range.from.getTime()) &&
      !Number.isNaN(range.to.getTime())
    ) {
      const endKey = DATE_RANGE_MAP[key];
      variables[key] = range.from.toISOString();
      variables[endKey] = range.to.toISOString();
    }
  }

  return variables;
};
