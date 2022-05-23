import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import CreateSalesPlan from '../components/CreateSalesPlan';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

// class CreateSalesPlanContainer extends React.Component {
//   render() {
//     return <CreateSalesPlan></CreateSalesPlan>;
//   }
// }
type Props = {
  closeModal: () => void;
  refetch: () => void;
};

function CreateSalesPlanContainer({ closeModal, refetch }: Props) {
  const units = useQuery(gql(queries.units));

  const branches = useQuery(gql(queries.branches));

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

  return (
    <CreateSalesPlan
      save={saveData}
      units={units.data ? units.data.units : []}
      branches={branches.data ? branches.data.branches : []}
      closeModal={closeModal}
    />
  );
}

export default CreateSalesPlanContainer;
