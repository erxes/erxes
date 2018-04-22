import { Alert, confirm } from 'modules/common/utils';

// get options for react-select-plus
export function selectOptions(array) {
  return array.map(item => ({ value: item._id, label: item.name }));
}

// get config options for react-select-plus
export function selectConfigOptions(array, CONSTANT) {
  return array.map(item => ({
    value: item,
    label: CONSTANT.find(el => el.value === item).label
  }));
}

// get user options for react-select-plus
export function selectUserOptions(array) {
  return array.map(item => ({
    value: item._id,
    label: item.details.fullName || item.email,
    avatar: item.details.avatar
  }));
}

export function collectOrders(array) {
  return array.map((item, index) => ({
    _id: item._id,
    order: index
  }));
}

// create or update deal
export function saveDeal(doc, props, context, callback, deal) {
  const { addMutation, editMutation, dealsQuery } = props;

  const { __ } = context;

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
export function removeDeal(_id, props, context, callback) {
  const { removeMutation, dealsQuery } = props;
  const { __ } = context;

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
