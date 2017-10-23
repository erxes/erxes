import { Alert } from 'modules/common/utils';

export const save = (
  variables,
  addMutation,
  editMutation,
  integration,
  refetch
) => {
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

      Alert.success('Congrats');

      window.location.href = `/settings/integrations/${window.location.search}`;
    })
    .catch(error => {
      Alert.error(error.message);
    });
};
