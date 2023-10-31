import { gql } from '@apollo/client';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from './constants';

import { IDateColumn } from '@erxes/ui/src/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  PRODUCT_TYPE_CHOISES,
  PRODUCT_CATEGORIES_STATUS_FILTER
} from './constants';
type Options = {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
};
export const categoryStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(PRODUCT_CATEGORIES_STATUS_FILTER)) {
    options.push({
      value: key,
      label: __(PRODUCT_CATEGORIES_STATUS_FILTER[key])
    });
  }

  return options;
};
// get options for react-select-plus
export function selectOptions(array: Options[] = []) {
  return array.map(item => ({ value: item._id, label: item.name }));
}

export function collectOrders(array: Options[] = []) {
  return array.map((item: Options, index: number) => ({
    _id: item._id,
    order: index
  }));
}

// a little function to help us with reordering the result
export const reorder = (
  list: any[],
  startIndex: number,
  endIndex: number
): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);

  result.splice(endIndex, 0, removed);

  return result;
};

type ReorderItemMap = {};

export const updateItemInfo = (state, item) => {
  const { itemMap } = state;
  const items = [...itemMap[item.stageId]];
  const index = items.findIndex(d => d._id === item._id);

  items[index] = item;

  return { ...itemMap, [item.stageId]: items };
};

export const getDefaultBoardAndPipelines = () => {
  const defaultBoards = localStorage.getItem(STORAGE_BOARD_KEY) || '{}';
  const defaultPipelines = localStorage.getItem(STORAGE_PIPELINE_KEY) || '{}';

  return {
    defaultBoards: JSON.parse(defaultBoards),
    defaultPipelines: JSON.parse(defaultPipelines)
  };
};

export const invalidateCache = () => {
  localStorage.setItem('cacheInvalidated', 'true');
};

export const toArray = (item: string | string[] = []) => {
  if (item instanceof Array) {
    return item;
  }

  return [item];
};

export const renderPriority = (priority?: string) => {
  if (!priority) {
    return null;
  }
};

export const generateButtonClass = (closeDate: Date, isComplete?: boolean) => {
  let colorName = '';

  if (isComplete) {
    colorName = 'green';
  } else if (closeDate) {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (new Date(closeDate).getTime() - now.getTime() < oneDay) {
      colorName = 'yellow';
    }

    if (now > closeDate) {
      colorName = 'red';
    }
  }

  return colorName;
};

export const generateButtonStart = (startDate: Date) => {
  let colorName = 'teal';

  if (startDate) {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (new Date(startDate).getTime() - now.getTime() < oneDay) {
      colorName = 'blue';
    }

    if (now > startDate) {
      colorName = 'red';
    }
  }

  return colorName;
};

export const onCalendarLoadMore = (fetchMore, queryName, skip: number) => {
  fetchMore({
    variables: { skip },
    updateQuery: (prevResult, { fetchMoreResult }) => {
      if (!fetchMoreResult || fetchMoreResult[queryName].length === 0) {
        return prevResult;
      }

      return {
        [queryName]: prevResult[queryName].concat(fetchMoreResult[queryName])
      };
    }
  });
};

export const getColors = (index: number) => {
  const COLORS = [
    '#EA475D',
    '#3CCC38',
    '#FDA50D',
    '#63D2D6',
    '#3B85F4',
    '#0A1E41',
    '#5629B6',
    '#6569DF',
    '#888888'
  ];

  if (index > 9) {
    return COLORS[2];
  }

  return COLORS[index];
};

export const isRefresh = (queryParams: any, routerUtils: any, history: any) => {
  const keys = Object.keys(queryParams || {});

  if (!(keys.length === 2 || (keys.includes('key') && keys.length === 3))) {
    routerUtils.setParams(history, { key: Math.random() });
  }
};

export const getBoardViewType = () => {
  let viewType = 'board';

  if (window.location.href.includes('calendar')) {
    viewType = 'calendar';
  }

  if (window.location.href.includes('activity')) {
    viewType = 'activity';
  }

  if (window.location.href.includes('conversion')) {
    viewType = 'conversion';
  }

  if (window.location.href.includes('list')) {
    viewType = 'list';
  }

  if (window.location.href.includes('chart')) {
    viewType = 'chart';
  }

  if (window.location.href.includes('gantt')) {
    viewType = 'gantt';
  }

  if (window.location.href.includes('time')) {
    viewType = 'time';
  }

  return viewType;
};

export const getWarningMessage = (type: string): string => {
  return `This will permanently delete the current ${type}. Are you absolutely sure?`;
};

export const getFilterParams = (
  queryParams: any,
  getExtraParams: (queryParams) => any
) => {
  if (!queryParams) {
    return {};
  }

  const selectType = {
    search: queryParams.search,
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    date: queryParams.date,
    branch: queryParams.branch,
    department: queryParams.department,
    unit: queryParams.unit,
    assignedUserIds: queryParams.assignedUserIds,
    labelIds: queryParams.labelIds,
    userIds: queryParams.userIds,
    segment: queryParams.segment,
    assignedToMe: queryParams.assignedToMe,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    pipelineId: queryParams.pipelineId,
    hasStartAndCloseDate: true,
    tagIds: queryParams.tagIds,
    limit: 100,
    ...getExtraParams(queryParams)
  };

  return selectType;
};
