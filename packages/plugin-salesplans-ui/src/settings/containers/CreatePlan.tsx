import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import CreatePlan from '../components/CreatePlan';

const CreatePlanContainer = () => {
  const [type, setType] = useState<string>('');

  const labelsQuery = useQuery(gql(queries.getLabels), {
    variables: { type }
  });
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

  useEffect(() => {
    labelsQuery.refetch({ type });
  }, [type]);

  return (
    <CreatePlan
      labels={labelsQuery.data ? labelsQuery.data.getLabels : []}
      type={type}
      save={save}
      setType={setType}
    />
  );
};

export default CreatePlanContainer;
