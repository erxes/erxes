import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import FormComponent from '../components/Form';

type Props = {
  initialData?: any;
  submit: (data: any) => void;
};

const FormContainer = (props: Props) => {
  const { initialData } = props;

  const [type, setType] = useState<string>(
    initialData && initialData.type ? initialData.type : ''
  );

  const labelsQuery = useQuery(gql(queries.getLabels), {
    variables: { type }
  });

  useEffect(() => {
    labelsQuery.refetch({ type });
  }, [type]);

  return (
    <FormComponent
      {...props}
      labels={labelsQuery.data ? labelsQuery.data.getLabels : []}
      type={type}
      setType={setType}
    />
  );
};

export default FormContainer;
