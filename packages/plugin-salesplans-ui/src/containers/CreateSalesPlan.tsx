import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { useQuery, useMutation, graphql } from 'react-apollo';
import CreateSalesPlan from '../components/CreateSalesPlan';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import { Spinner } from '@erxes/ui/src/components';

// class CreateSalesPlanContainer extends React.Component {
//   render() {
//     return <CreateSalesPlan></CreateSalesPlan>;
//   }
// }
type Props = {
  closeModal: () => void;
  refetch: () => void;
};

type FinalProps = {
  units: any;
  branches: any;
} & Props;

function CreateSalesPlanContainer({
  closeModal,
  refetch,
  units,
  branches
}: FinalProps) {
  // const units = useQuery(gql(queries.units), {
  //   fetchPolicy: "network-only",
  // });

  // const branches = useQuery(gql(queries.branches), {
  //   fetchPolicy: "network-only",
  // });

  const [save] = useMutation(gql(mutations.createSalesLog));

  const saveData = doc => {
    save({ variables: { ...doc } })
      .then(() => {
        Alert.success('Successfully saved!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
    closeModal();
    refetch();
  };

  console.log('container unit', units ? units.units : []);

  if (units.loading) return <Spinner objective={true} />;

  if (branches.loading) return <Spinner objective={true} />;

  return (
    <CreateSalesPlan
      save={saveData}
      units={units ? units.units : []}
      branches={branches ? branches.branches : []}
      closeModal={closeModal}
    />
  );
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.units), {
      name: 'units',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.branches), {
      name: 'branches',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(CreateSalesPlanContainer)
);
