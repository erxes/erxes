import React from 'react';
import { useMutation } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import EditPlan from '../components/EditPlan';

const EditPlanContainer = () => {
  const [saveMutation] = useMutation(gql(mutations.createSalesLog));

  const save = (doc: any) => {
    saveMutation({ variables: { ...doc } })
      .then(() => {
        Alert.success('Successfully saved!');
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  return <EditPlan save={save} />;
};

export default EditPlanContainer;
