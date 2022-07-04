import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import ManageLabelsComponent from '../../components/actions/ManageLabels';

type Props = {
  closeModal: () => void;
};

const ManageLabelsContainer = (props: Props) => {
  const { closeModal } = props;
  const [type, setType] = useState('');

  const [save] = useMutation(gql(mutations.saveLabels));
  const [remove] = useMutation(gql(mutations.removeLabel));

  const labelsQuery = useQuery(gql(queries.labels), {
    variables: { type }
  });

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
    <ManageLabelsComponent
      getLabels={labelsQuery.data ? labelsQuery.data.labels : []}
      type={type}
      remove={removedata}
      save={saveData}
      refetch={refetch}
      onChangeType={onChangeType}
      closeModal={closeModal}
    />
  );
};
export default ManageLabelsContainer;
