import React, { useEffect } from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import { Alert } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import ManageConfigsComponent from '../components/ManageConfigs';

type Props = {
  closeModal: () => void;
};

type FinalProps = {
  dayConfigQuery: any;
  save: any;
  remove: any;
} & Props;

function ConfigContainer({
  closeModal,
  dayConfigQuery,
  save,
  remove
}: FinalProps) {
  useEffect(() => refetch(), []);

  const saveData = (update, add) => {
    save({ variables: { update, add } })
      .then(() => {
        Alert.success('Day Configs successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const refetch = () => {
    dayConfigQuery.refetch();
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

  if (dayConfigQuery.loading) return <Spinner objective={true} />;

  if (dayConfigQuery.error) {
    return <div>{dayConfigQuery.error.message}</div>;
  }

  return (
    <ManageConfigsComponent
      save={saveData}
      data={dayConfigQuery ? dayConfigQuery.timeframes : []}
      closeModal={closeModal}
      // refetch={refetch}
      removedata={removedata}
    />
  );
}
export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.timeframes), {
      name: 'dayConfigQuery'
    }),
    graphql<Props>(gql(mutations.saveTimeframes), {
      name: 'save'
    }),
    graphql<Props>(gql(mutations.removeTimeframe), {
      name: 'remove'
    })
  )(ConfigContainer)
);
