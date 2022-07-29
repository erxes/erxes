import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import RouteForm from '../../components/routes/Form';
import { mutations, queries } from '../../graphql';
import { IRoute } from '../../types';

type Props = {
  route?: IRoute;
  closeModal: () => void;
};

const RouteFormContainer = (props: Props) => {
  const routeDetailQueryResponse = useQuery(gql(queries.routeDetail), {
    fetchPolicy: 'network-only',
    skip: !props.route,
    variables: { _id: props.route && props.route?._id }
  });

  const { data, loading } = useQuery(gql(queries.directions), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999 }
  });

  const routesQueryResponse = useQuery(gql(queries.routesQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999 }
  });

  if (
    (routeDetailQueryResponse.loading, loading || routesQueryResponse.loading)
  ) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editRoute : mutations.addRoute}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a route`}
      />
    );
  };

  const updatedProps = {
    ...props,
    directions: data.directions.list,
    route:
      (routeDetailQueryResponse.data &&
        routeDetailQueryResponse.data.routeDetail) ||
      undefined,
    routes: routesQueryResponse.data.routes.list || [],
    renderButton
  };

  return <RouteForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.routesQuery)
    }
  ];
};

export default RouteFormContainer;
