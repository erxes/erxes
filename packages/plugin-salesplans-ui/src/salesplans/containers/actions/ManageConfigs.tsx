import React, { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import ManageConfigsComponent from '../../components/actions/ManageConfigs';

type Props = {
  closeModal: () => void;
};

const ManageConfigsContainer = (props: Props) => {
  const { closeModal } = props;
  const [edit] = useMutation(gql(mutations.timeframesEdit));
  const [remove] = useMutation(gql(mutations.timeframesRemove));

  const dayConfigQuery = useQuery(gql(queries.timeframes), {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  const editData = (update: any, add: any) => {
    edit({ variables: { update, add } })
      .then(() => {
        Alert.success('Day Configs successfully saved!');
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

  useEffect(() => {
    dayConfigQuery.refetch();
  }, []);

  return (
    <ManageConfigsComponent
      data={dayConfigQuery.data ? dayConfigQuery.data.timeframes : []}
      closeModal={closeModal}
      edit={editData}
      remove={removeData}
    />
  );
};

export default ManageConfigsContainer;
