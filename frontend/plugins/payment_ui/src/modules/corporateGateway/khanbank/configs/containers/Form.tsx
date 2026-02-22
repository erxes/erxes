import { gql, useMutation } from '@apollo/client';
import ConfigForm from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
  config?: any;
};

const ConfigFormContainer = ({ closeModal, config }: Props) => {
  const [addConfig, { loading: addLoading }] = useMutation(
    gql(mutations.addMutation),
    {
      refetchQueries: [
        {
          query: gql(queries.listQuery),
          fetchPolicy: 'network-only',
        },
      ],
    },
  );

  const [editConfig, { loading: editLoading }] = useMutation(
    gql(mutations.editMutation),
    {
      refetchQueries: [
        {
          query: gql(queries.listQuery),
          fetchPolicy: 'network-only',
        },
      ],
    },
  );

  const handleSubmit = async (values: any) => {
    if (config?._id) {
      await editConfig({
        variables: values,
      });
    } else {
      await addConfig({
        variables: values,
      });
    }

    closeModal();
  };

  return (
    <ConfigForm
      config={config}
      onSubmit={handleSubmit}
      closeModal={closeModal}
      loading={addLoading || editLoading}
    />
  );
};

export default ConfigFormContainer;