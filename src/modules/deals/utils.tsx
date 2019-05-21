import { Tip } from 'modules/common/components';
import { DealDate } from 'modules/deals/styles/deal';
import { Amount } from 'modules/deals/styles/stage';
import * as moment from 'moment';
import * as React from 'react';
import { IDealMap, IDraggableLocation } from './types';

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

// get config options for react-select-plus
export function selectConfigOptions(array: string[] = [], CONSTANT: any) {
  return array.map(item => ({
    value: item,
    label: CONSTANT.find(el => el.value === item).label
  }));
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

type ReorderDealMap = {
  dealMap: IDealMap;
  source: IDraggableLocation;
  destination: IDraggableLocation;
};

export const reorderDealMap = ({
  dealMap,
  source,
  destination
}: ReorderDealMap) => {
  const current = [...dealMap[source.droppableId]];
  const next = [...dealMap[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);

    const updatedDealMap = {
      ...dealMap,
      [source.droppableId]: reordered
    };

    return {
      dealMap: updatedDealMap
    };
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);

  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...dealMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    dealMap: result
  };
};

export const renderDealDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) {
    return null;
  }

  return (
    <Tip text={moment(date).format(format)}>
      <DealDate>{moment(date).format('lll')}</DealDate>
    </Tip>
  );
};

export const renderDealAmount = amount => {
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
