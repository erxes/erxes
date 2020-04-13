import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/boards/constants';
import { Amount } from 'modules/boards/styles/stage';
import React from 'react';
import PriorityIndicator from './components/editForm/PriorityIndicator';
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

export const orderHelper = ({
  prevOrder,
  afterOrder
}: {
  prevOrder: number;
  afterOrder: number;
}) => {
  if (!prevOrder && !afterOrder) {
    return 1;
  }

  if (!afterOrder) {
    return parseFloat(prevOrder.toFixed()) + 1;
  }

  const splitAfter = afterOrder.toString().split('.');
  const intPart = parseFloat(splitAfter[0]);
  const fraction = '0.'.concat(splitAfter[1] || '0');

  if (!prevOrder) {
    if (splitAfter.length === 1) {
      return intPart === 1 ? 0.9 : intPart - 1;
    }

    const endChar = fraction.substr(-1);
    const endNum =
      endChar === '1' ? '09' : (parseFloat(endChar) - 1).toString();
    return intPart + parseFloat(fraction.slice(0, -1).concat(endNum));
  }

  const prevFraction = '0.'.concat(prevOrder.toString().split('.')[1] || '0');
  const diffLen =
    prevFraction.length > fraction.length
      ? prevFraction.length
      : fraction.length;

  if (prevFraction.length === fraction.length || fraction === '0.0') {
    const diff = parseFloat((afterOrder - prevOrder).toFixed(diffLen));
    return diff.toString().substr(-1) === '1'
      ? parseFloat((afterOrder - 0.1 ** (diffLen - 1)).toFixed(diffLen + 1))
      : parseFloat((afterOrder - 0.1 ** (diffLen - 2)).toFixed(diffLen));
  } else {
    return parseFloat(
      (
        afterOrder - parseFloat('0.'.concat('0'.repeat(diffLen - 3), '1'))
      ).toFixed(diffLen)
    );
  }
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

  const prevOrder =
    destination.index > 0 ? next[destination.index - 1].order : 0;
  const afterOrder =
    next.length > destination.index ? next[destination.index].order : 0;
  target.order = orderHelper({ prevOrder, afterOrder }) || 1;

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);

    const updateditemMap = {
      ...itemMap,
      [source.droppableId]: reordered
    };

    return {
      itemMap: updateditemMap,
      target
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
    itemMap: result,
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
