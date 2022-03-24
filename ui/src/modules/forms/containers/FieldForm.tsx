import React from 'react';
import { queries } from 'modules/bookings/graphql';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';
import FieldForm from '../components/FieldForm';
import { IField } from 'modules/settings/properties/types';
import { IProductCategory } from 'modules/settings/productService/types';

type Props = {
  onSubmit: (field: IField) => void;
  onDelete: (field: IField) => void;
  onCancel: () => void;
  mode: 'create' | 'update';
  field: IField;
  fields: IField[];
  numberOfPages: number;
  googleMapApiKey?: string;
};

const FormContainer = (props: Props) => {
  const { data, loading, error } = useQuery(gql(queries.productCategories), {
    skip: props.field.type !== 'productCategory'
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const productCategories: IProductCategory[] =
    (data && data.productCategories) || [];

  console.log('productCategories: ', productCategories);

  return <FieldForm {...props} productCategories={productCategories} />;
};

export default FormContainer;
