import gql from 'graphql-tag';
import { ButtonMutate, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../brands/types';

import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import { SelectBrand } from '../components';

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
    return (
      <ButtonMutate
        mutation={brandMutations.brandAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
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
