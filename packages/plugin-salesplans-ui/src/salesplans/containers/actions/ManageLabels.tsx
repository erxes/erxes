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
  const [type, setType] = useState<string>('');

  const [edit] = useMutation(gql(mutations.labelsEdit));
  const [remove] = useMutation(gql(mutations.labelsRemove));

  const labelsQuery = useQuery(gql(queries.labels), {
    variables: { type },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  const editData = (update, add) => {
    edit({ variables: { update, add } })
      .then(() => {
        Alert.success('Successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });

    closeModal();
  };

  const removeData = (_id: string) => {
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
    labelsQuery.refetch();
  };

  return (
    <ManageLabelsComponent
      getLabels={labelsQuery.data ? labelsQuery.data.labels : []}
      type={type}
      onChangeType={onChangeType}
      closeModal={closeModal}
      edit={editData}
      remove={removeData}
    />
  );
};

export default ManageLabelsContainer;
