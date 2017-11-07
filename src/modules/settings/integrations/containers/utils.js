import { Alert } from 'modules/common/utils';

export const save = ({
  history,
  variables,
  addMutation,
  editMutation,
  integration,
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

      Alert.success('Congrats');

      history.push(`/settings/integrations/${window.location.search}`);
    })
    .catch(error => {
      Alert.error(error.message);
    });
};
