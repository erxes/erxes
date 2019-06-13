import gql from 'graphql-tag';
import { ButtonMutate, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../brands/types';

import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import { IButtonMutateProps } from '../../../common/types';
import { SelectBrand } from '../components';

type Props = {
  onChange: () => void;
  defaultValue: string;
  creatable: boolean;
  isRequired?: boolean;
};
type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props;

const SelectBrandContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery } = props;

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
        icon="send"
        successMessage={`You successfully added a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    brands,
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
