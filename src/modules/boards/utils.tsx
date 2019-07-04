import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/boards/constants';
import { Amount } from 'modules/boards/styles/stage';
import React from 'react';
import { IDraggableLocation, IItemMap } from './types';

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
  source: IDraggableLocation;
  destination: IDraggableLocation;
};

export const reorderItemMap = ({
  itemMap,
  source,
  destination
}: ReorderItemMap) => {
  const current = [...itemMap[source.droppableId]];
  const next = [...itemMap[destination.droppableId]];

  const target = current[source.index];
  target.modifiedAt = new Date();

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);

    const updateditemMap = {
      ...itemMap,
      [source.droppableId]: reordered
    };

    return {
      itemMap: updateditemMap
    };
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);

  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...itemMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    itemMap: result
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

export const renderAmount = amount => {
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
