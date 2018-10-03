import { __, Alert, confirm } from 'modules/common/utils';
import { IUser, IUserDetails } from '../auth/types';
import { IDeal } from './types';

type Options = {
  _id: string,
  name?: string
	type?: string,
	index?: number,
	itemId?: string
}

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
    const user =  item || {} as IUser;
    const details =  item.details || {} as IUserDetails;
    
    return {
      value: user._id,
      label: details.fullName || user.email,
      avatar: details.avatar
    }
  });
}

export function collectOrders(array: Options[] = []) {
  return array.map((item: Options, index: number) => ({
    _id: item._id,
    order: index
  }));
}

// create or update deal
export function saveDeal(doc: any, props: any, context: any, callback: any, deal?: IDeal) {
  const { addMutation, editMutation, dealsQuery } = props;

  let mutation = addMutation;

  // if edit mode
  if (deal) {
    mutation = editMutation;
    doc._id = deal._id;
  }

  mutation({
    variables: doc
  })
    .then(({ data }) => {
      Alert.success(__('Successfully saved.'));

      dealsQuery.refetch();

      callback(data);
    })
    .catch(error => {
      Alert.error(error.message);
    });
}

// remove deal
export function removeDeal(_id: string, props: any, context: any, callback: any) {
  const { removeMutation, dealsQuery } = props;

  confirm().then(() => {
    removeMutation({
      variables: { _id }
    })
      .then(({ data: { dealsRemove } }) => {
        Alert.success(__('Successfully deleted.'));

        if (callback) callback(dealsRemove);

        dealsQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  });
}
