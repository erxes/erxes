import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, ButtonMutate } from 'erxes-ui';
import { IFormProps } from 'erxes-ui/lib/types';
import { IButtonMutateProps } from '../../types';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { BrandsQueryResponse } from '../../types';
import SelectBrand from '../components/SelectBrand';

type Props = {
  onChange: () => void;
  defaultValue: string;
  creatable: boolean;
  isRequired?: boolean;
  formProps: IFormProps;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props;

const SelectBrandContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery, formProps } = props;

  const brands = brandsQuery.brands || [];

  if (brandsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      brandsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.brandAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    brands,
    formProps,
    renderButton
  };

  return <SelectBrand {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.brands),
      variables: {}
    }
  ];
};

export default compose(
  graphql<BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      refetchQueries: getRefetchQueries
    })
  })
)(SelectBrandContainer);
