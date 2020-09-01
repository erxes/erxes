import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/boards/constants';
import { Amount } from 'modules/boards/styles/stage';
import React from 'react';
import PriorityIndicator from './components/editForm/PriorityIndicator';
import { IDraggableLocation, IItem, IItemMap } from './types';

type Options = {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
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

type ReorderItemMap = {
  itemMap: IItemMap;
  source: IDraggableLocation & { item?: IItem };
  destination: IDraggableLocation;
};

export const reorderItemMap = ({
  itemMap,
  source,
  destination
}: ReorderItemMap) => {
  const current = [...itemMap[source.droppableId]];
  const next = [...itemMap[destination.droppableId]];

  let target = current[source.index];

  if (!target && source.item) {
    target = source.item;
  }

  target.modifiedAt = new Date();

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    // drag down, index -1
    const specInd = source.index < destination.index ? 0 : 1;

    const aboveItem = next[destination.index - specInd];

    if (source.index !== undefined) {
      current.splice(source.index, 1);
    }

    if (destination.index !== undefined) {
      current.splice(destination.index, 0, target);
    }

    const updateditemMap = {
      ...itemMap,
      [source.droppableId]: current
    };

    return {
      itemMap: updateditemMap,
      aboveItem,
      target
    };
  }

  // moving to different list

  // remove from original
  if (source.index !== undefined) {
    current.splice(source.index, 1);
  }

  // insert into next
  if (destination.index !== undefined && next.length >= destination.index) {
    next.splice(destination.index, 0, target);
  }

  const result = {
    ...itemMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    itemMap: result,
    aboveItem: next[destination.index - 1],
    target
  };
};

export const getDefaultBoardAndPipelines = () => {
  const defaultBoards = localStorage.getItem(STORAGE_BOARD_KEY) || '{}';
  const defaultPipelines = localStorage.getItem(STORAGE_PIPELINE_KEY) || '{}';

  return {
    defaultBoards: JSON.parse(defaultBoards),
    defaultPipelines: JSON.parse(defaultPipelines)
  };
};

export const renderAmount = (amount = {}) => {
  if (Object.keys(amount).length === 0) {
    return null;
  }

  return (
    <Amount>
      {Object.keys(amount).map(key => (
        <li key={key}>
          {amount[key].toLocaleString()} <span>{key}</span>
        </li>
      ))}
    </Amount>
  );
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

  return <PriorityIndicator value={priority} />;
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
