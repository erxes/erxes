import { Alert } from 'modules/common/utils';

export const save = ({
  variables,
  addMutation,
  editMutation,
  integration,
  onSave,
  refetch
}) => {
  let mutation = addMutation;

  if (integration && integration._id) {
    mutation = editMutation;
    variables._id = integration._id;
  }

  mutation({
    variables
  })
    .then(() => {
      if (refetch) {
        refetch();
      }

      if (onSave) {
        onSave();
      }

      Alert.success('Congrats');
    })
    .catch(error => {
      Alert.error(error.message);
    });
};

export const integrationsListParams = queryParams => ({
  searchValue: queryParams.searchValue,
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  kind: queryParams.kind
});
