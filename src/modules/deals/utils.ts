import { __, Alert, confirm } from 'modules/common/utils';
import { IUser, IUserDetails } from '../auth/types';
import {
  IDeal,
  IDealMap,
  IDealParams,
  IDraggableLocation,
  RemoveDealMutation,
  SaveDealMutation
} from './types';

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

// get user options for react-select-plus
export function selectUserOptions(array: IUser[] = []) {
  return array.map(item => {
    const user = item || ({} as IUser);
    const details = item.details || ({} as IUserDetails);

    return {
      value: user._id,
      label: details.fullName || user.email,
      avatar: details.avatar
    };
  });
}

export function collectOrders(array: Options[] = []) {
  return array.map((item: Options, index: number) => ({
    _id: item._id,
    order: index
  }));
}

// create or update deal
export function saveDeal(
  doc: IDealParams,
  addMutation: SaveDealMutation,
  editMutation: SaveDealMutation,
  callback: (data: any) => void,
  deal?: IDeal
) {
  let mutation = addMutation;

  // if edit mode
  if (deal) {
    mutation = editMutation;
    doc._id = deal._id;
  }

  mutation({ variables: doc })
    .then(({ data }) => {
      Alert.success(__('Successfully saved.'));

      callback(data);
    })
    .catch(error => {
      Alert.error(error.message);
    });
}

// remove deal
export function removeDeal(
  _id: string,
  removeMutation: RemoveDealMutation,
  callback: (dealsRemove: IDeal) => void
) {
  confirm().then(() => {
    removeMutation({
      variables: { _id }
    })
      .then(({ data: { dealsRemove } }) => {
        Alert.success(__('Successfully deleted.'));

        if (callback) callback(dealsRemove);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  });
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
