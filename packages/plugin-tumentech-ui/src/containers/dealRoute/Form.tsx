import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql, useLazyQuery } from '@apollo/client';
import React from 'react';

import DealRouteForm from '../../components/dealRoute/Form';
import { mutations, queries } from '../../graphql';
import { IDealRoute } from '../../types';

type Props = {
  dealId: string;
  dealRoute?: IDealRoute;
  closeModal: () => void;
};

const DealRouteFormContainer = (props: Props) => {
  const [
    getRoutes,
    { data = {} as any } //check - SkillsQueryResponse
  ] = useLazyQuery(gql(queries.routesQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999, searchValue: '' }
  });

  const onSearch = (value: string) => {
    getRoutes({ variables: { perPage: 9999, searchValue: value } });
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.setDealRoute}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(props.dealId)}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully updated a location`}
      />
    );
  };

  const updatedProps = {
    ...props,
    routes: (data && data.routes && data.routes.list) || [],
    onSearch,
    renderButton
  };

  return <DealRouteForm {...updatedProps} />;
};

const getRefetchQueries = (dealId: string) => {
  return [
    {
      query: gql(queries.dealRouteQuery),
      variables: {
        dealId
      }
    }
  ];
};

export default DealRouteFormContainer;
