import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import FormComponent from '../components/Form';

type Props = {
  initialData: any;
  submit: (data: any) => void;
};

const FormContainer = (props: Props) => {
  const { initialData } = props;
  const [type, setType] = useState<string>(
    initialData && initialData.type ? initialData.type : ''
  );

  const productsQuery = useQuery(gql(queries.products));
  const productCategoriesQuery = useQuery(gql(queries.productCategories));
  const getTimeframesQuery = useQuery(gql(queries.getTimeframes));
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
      products={productsQuery.data ? productsQuery.data.products : []}
      categories={
        productCategoriesQuery.data
          ? productCategoriesQuery.data.productCategories
          : []
      }
      timeframes={
        getTimeframesQuery.data ? getTimeframesQuery.data.getTimeframes : []
      }
      type={type}
      setType={setType}
    />
  );
};

export default FormContainer;
