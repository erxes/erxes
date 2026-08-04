import { useMutation, useQuery } from '@apollo/client';
import { configDetail } from '../graphql/queries';
import { addConfig, editConfig } from '../graphql/mutations';
import Form from '../components/Form';
import { ITdbConfig } from '../types';

type Props = {
  configId?: string; // if provided, we're editing
  closeModal: () => void;
  refetchList: () => void; // to refresh the list after save
};

const ConfigFormContainer = ({ configId, closeModal, refetchList }: Props) => {
  const [add] = useMutation(addConfig);
  const [edit] = useMutation(editConfig);

  // If editing, fetch existing config
  const { data, loading } = useQuery(configDetail, {
    variables: { _id: configId },
    skip: !configId,
  });

  const config = data?.tdbConfigsDetail as ITdbConfig | undefined;

  const onSubmit = async (doc: any) => {
    try {
      if (configId) {
        await edit({ variables: { _id: configId, ...doc } });
      } else {
        await add({ variables: doc });
      }
      refetchList();
      closeModal();
    } catch (error) {
      console.error('Error saving TDB config:', error);
    }
  };

  // while loading, show a spinner or nothing
  if (loading && configId) return <div>Loading...</div>;

  return <Form config={config} onSubmit={onSubmit} closeModal={closeModal} />;
};

export default ConfigFormContainer;
