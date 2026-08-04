import { gql, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui/hooks/use-toast';
import ConfigForm from '../components/Form';
import { mutations, queries } from '../../graphql';

type Props = {
  closeModal: () => void;
};

const ConfigFormContainer = ({ closeModal }: Props) => {
  const [addMutation, { loading: adding }] = useMutation(
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

  const [editMutation, { loading: editing }] = useMutation(
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

  const onSubmit = async (values: any, object?: any) => {
    try {
      if (object) {
        await editMutation({ variables: values });

        toast({
          variant: 'success',
          title: 'Config updated',
          description: 'You successfully updated a config.',
        });
      } else {
        await addMutation({ variables: values });

        toast({
          variant: 'success',
          title: 'Config added',
          description: 'You successfully added a config.',
        });
      }

      closeModal();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: e.message,
      });
    }
  };

  return (
    <ConfigForm
      onSubmit={onSubmit}
      closeModal={closeModal}
      loading={adding || editing}
    />
  );
};

export default ConfigFormContainer;
