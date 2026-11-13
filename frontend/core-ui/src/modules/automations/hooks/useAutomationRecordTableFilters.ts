import { parseDateRangeFromString, useNonNullMultiQueryState } from 'erxes-ui';

export const useAutomationRecordTableFilters = () => {
  const {
    searchValue,
    status,
    createdAt,
    createdByIds,
    updatedAt,
    updatedByIds,
    tagIds,
    actionTypes,
    triggerTypes,
    folderId,
  } = useNonNullMultiQueryState<{
    searchValue?: string;
    status?: string;
    createdAt: string;
    createdByIds?: string;
    updatedAt: string;
    updatedByIds?: string;
    tagIds?: string[];
    actionTypes?: string[];
    triggerTypes?: string[];
    folderId?: string;
  }>([
    'searchValue',
    'status',
    'createdAt',
    'createdByIds',
    'updatedByIds',
    'updatedAt',
    'tagIds',
    'actionTypes',
    'triggerTypes',
    'folderId',
  ]);

  const filters: any = {};

  if (tagIds?.length) {
    filters.tagIds = tagIds;
  }

  if (searchValue) {
    filters.searchValue = searchValue;
  }

  if (status) {
    filters.status = status;
  }
  if (createdAt) {
    filters.createdAtFrom = parseDateRangeFromString(createdAt)?.from;
    filters.createdAtTo = parseDateRangeFromString(createdAt)?.to;
  }
  if (createdByIds?.length) {
    filters.createdByIds = createdByIds;
  }
  if (updatedAt) {
    filters.updatedAtFrom = parseDateRangeFromString(updatedAt)?.from;
    filters.updatedAtTo = parseDateRangeFromString(updatedAt)?.to;
  }
  if (updatedByIds?.length) {
    filters.updatedByIds = updatedByIds;
  }
  if (actionTypes?.length) {
    filters.actionTypes = actionTypes;
  }
  if (triggerTypes?.length) {
    filters.triggerTypes = triggerTypes;
  }

  // Inside a folder: only its automations. At the top, a filter or search
  // looks through every folder; otherwise only what no folder holds shows.
  if (folderId) {
    filters.folderId = folderId;
  } else if (!Object.keys(filters).length) {
    filters.withoutFolder = true;
  }

  return filters;
};
