import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import CreateLabel from '../components/CreateLabel';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  closeModal: () => void;
};

function CreateLabelContainer({ closeModal }: Props) {
  const [type, setType] = useState('');

  const labelsQuery = useQuery(gql(queries.getMiniPlanLabels), {
    variables: { type }
  });

  if (labelsQuery.error) {
    return <div>{labelsQuery.error.message}</div>;
  }

  const [remove] = useMutation(gql(mutations.removeMiniPlanLabels));

  const [save] = useMutation(gql(mutations.saveMiniPlanLabel));

  const saveData = (update, add) => {
    save({ variables: { update, add } })
      .then(() => {
        Alert.success('Successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
    closeModal();
  };

  const removedata = (_id: string) => {
    remove({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const onChangeType = (type: string) => {
    setType(type);
    labelsQuery.refetch({ type });
  };

  const refetch = () => {
    labelsQuery.refetch({ type });
  };

  return (
    <CreateLabel
      getLabels={labelsQuery.data ? labelsQuery.data.getMiniPlanLabels : []}
      type={type}
      remove={removedata}
      save={saveData}
      refetch={refetch}
      onChangeType={onChangeType}
      closeModal={closeModal}
    ></CreateLabel>
  );
}
export default CreateLabelContainer;
