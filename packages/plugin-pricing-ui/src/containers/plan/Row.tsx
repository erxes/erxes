import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import { Alert, confirm } from '@erxes/ui/src/utils';
// local
import { queries, mutations } from '../../graphql';
import RowComponent from '../../components/plan/Row';

type Props = {
  data: any;
};

const RowContainer = (props: Props) => {
  const { data } = props;
  // Hooks
  const [remove] = useMutation(gql(mutations.pricingPlanRemove), {
    refetchQueries: [{ query: gql(queries.pricingPlans) }]
  });
  const [edit] = useMutation(gql(mutations.pricingPlanEdit), {
    refetchQueries: [{ query: gql(queries.pricingPlans) }]
  });

  const planRemove = () => {
    confirm()
      .then(() => {
        remove({
          variables: { id: props.data._id }
        })
          .then(() => {
            Alert.success('Request successful!');
          })
          .catch((error: any) => Alert.error(error.message));
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const handleStatus = (status: string) => {
    confirm()
      .then(() => {
        edit({
          variables: { doc: { _id: data._id, status } }
        })
          .then(() => {
            Alert.success('Request successful!');
          })
          .catch((error: any) => Alert.error(error.message));
      })
      .catch((error: any) => Alert.error(error.message));
  };

  return (
    <RowComponent {...props} remove={planRemove} handleStatus={handleStatus} />
  );
};

export default RowContainer;
