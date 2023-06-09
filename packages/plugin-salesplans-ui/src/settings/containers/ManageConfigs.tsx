import React, { useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import ManageConfigsComponent from '../components/ManageConfigs';
import { ITimeframe } from '../types';

type Props = {
  closeModal: () => void;
};

const ManageConfigsContainer = (props: Props) => {
  const { closeModal } = props;
  const [edit] = useMutation(gql(mutations.timeframesEdit));

  const dayConfigQuery = useQuery(gql(queries.timeframes), {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  const editData = (docs: ITimeframe[]) => {
    let before: ITimeframe | undefined = undefined;
    const checker = [
      ...docs.sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
    ];
    for (const data of checker) {
      if ((data.startTime || 0) > (data.endTime || 0)) {
        return Alert.error(`Must start is greater than end - "${data.name}"`);
      }

      if (before && (before.endTime || 0) > (data.startTime || 0)) {
        return Alert.error(`duplicated time - "${data.name}"`);
      }

      before = data;
    }

    edit({ variables: { docs } })
      .then(() => {
        Alert.success('Day Configs successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });

    closeModal();
  };

  useEffect(() => {
    dayConfigQuery.refetch();
  }, []);

  return (
    <ManageConfigsComponent
      data={dayConfigQuery.data ? dayConfigQuery.data.timeframes : []}
      closeModal={closeModal}
      edit={editData}
    />
  );
};

export default ManageConfigsContainer;
