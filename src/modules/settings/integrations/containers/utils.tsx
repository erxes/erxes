import { Alert } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';

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
  ...generatePaginationParams(queryParams),
  searchValue: queryParams.searchValue,
  kind: queryParams.kind
});
