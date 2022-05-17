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
  const units = useQuery(gql(queries.getUnits));

  const branches = useQuery(gql(queries.getBranches));

  const [save] = useMutation(gql(mutations.saveSalesLog));

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
      units={units.data ? units.data.getUnits : []}
      branches={branches.data ? branches.data.getBranches : []}
      closeModal={closeModal}
    />
  );
}

export default CreateSalesPlanContainer;
