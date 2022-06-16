import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import queryString from 'query-string';
import Form from '../components/Form';

type Props = {
  edit?: boolean;
  submit: (data: any) => void;
};

const FormContainer = (props: Props) => {
  const [type, setType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const location = useLocation();
  const query = queryString.parse(location.search);
  const salesLogId = query.salesLogId ? query.salesLogId : '';

  const productsQuery = useQuery(gql(queries.products));
  const productCategoriesQuery = useQuery(gql(queries.productCategories));
  const getTimeframesQuery = useQuery(gql(queries.getTimeframes));
  const labelsQuery = useQuery(gql(queries.getLabels), {
    variables: { type }
  });

  let getSalesLogDetailQuery: any;
  let data: any = {};

  if (props.edit) {
    getSalesLogDetailQuery = useQuery(gql(queries.getSalesLogDetail), {
      variables: { salesLogId }
    });

    const salesLogDetail = getSalesLogDetailQuery.data
      ? getSalesLogDetailQuery.data.getSalesLogDetail
      : {};

    if (salesLogDetail.type && salesLogDetail.type !== type)
      setType(salesLogDetail.type);

    data = {
      name: salesLogDetail.name ? salesLogDetail.name : '',
      description: salesLogDetail.description ? salesLogDetail.description : '',
      type: salesLogDetail.type ? salesLogDetail.type : type,
      date: salesLogDetail.createdAt ? salesLogDetail.createdAt : '',
      departmentId: salesLogDetail.departmentDetail
        ? salesLogDetail.departmentDetail._id
        : '',
      branchId: salesLogDetail.branchDetail
        ? salesLogDetail.branchDetail._id
        : '',
      labels: salesLogDetail.labels ? salesLogDetail.labels : ''
    };
  }

  useEffect(() => {
    labelsQuery.refetch({ type });
  }, [type]);

  return (
    <Form
      {...props}
      type={type}
      setType={setType}
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
      data={data}
    />
  );
};

export default FormContainer;
