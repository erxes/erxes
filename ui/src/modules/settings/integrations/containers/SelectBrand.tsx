import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../brands/types';
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
        mutation={brandMutations.brandAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
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
      query: gql(brandQueries.brands),
      variables: {}
    }
  ];
};

export default compose(
  graphql<BrandsQueryResponse>(gql(brandQueries.brands), {
    name: 'brandsQuery',
    options: () => ({
      refetchQueries: getRefetchQueries
    })
  })
)(SelectBrandContainer);
