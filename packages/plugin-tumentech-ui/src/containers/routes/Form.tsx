import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import RouteForm from '../../components/routes/Form';
import { mutations, queries } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

type Props = {
  closeModal: () => void;
};

const RouteFormContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.directions), {
    fetchPolicy: 'network-only'
  });

  const routesQueryResponse = useQuery(gql(queries.routesQuery), {
    fetchPolicy: 'network-only'
  });

  if (loading || routesQueryResponse.loading) {
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
    directions: data.directions,
    routes: routesQueryResponse.data.routes || [],
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
