import gql from 'graphql-tag';
import { ButtonMutate, Icon } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/brands/graphql';
import { BrandsCountQueryResponse } from 'modules/settings/brands/types';
import React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';

type Props = { changeStep: () => void };

type FinalProps = { brandsCountQuery: BrandsCountQueryResponse } & Props;

const BrandAddContainer = (props: ChildProps<FinalProps>) => {
  const { brandsCountQuery } = props;

  const brandsTotalCount = brandsCountQuery.brandsTotalCount || 0;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.brandAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        disabled={!values}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      >
        {__('Next')} <Icon icon="rightarrow-2" />
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    brandsTotalCount,
    renderButton
  };

  return <BrandAdd {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.brands),
      variables: { perPage: 0 }
    },
    { query: gql(queries.brandsCount) }
  ];
};

const WithQuery = compose(
  graphql<BrandsCountQueryResponse>(gql(queries.brandsCount), {
    name: 'brandsCountQuery'
  })
)(BrandAddContainer);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
