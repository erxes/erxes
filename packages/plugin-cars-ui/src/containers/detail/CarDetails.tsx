import { EmptyState, Spinner, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import CarDetails from '../../components/detail/CarDetails';
import { mutations, queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  id: string;
};
type FinalProps = {
  carDetailQuery: DetailQueryResponse;
  currentUser: IUser;
  carEditMutation: any;
} & Props;

const CarDetailsContainer = (props: FinalProps) => {
  const { id, carDetailQuery, currentUser, carEditMutation } = props;

  if (carDetailQuery.loading) {
    return <Spinner objective={true} />;
  }
  if (!carDetailQuery.carDetail) {
    return <EmptyState text="Car not found" image="/images/actions/24.svg" />;
  }

  const carDetail = carDetailQuery.carDetail;

  const editCar = variables => {
    carEditMutation({
      variables: {
        _id: id,
        ...variables
      }
    })
      .then(() => {
        Alert.success('You successfully updated a car');
      })
      .catch(error => {
        alert(error.message);
      });
  };
  const updatedProps = {
    ...props,
    loading: carDetailQuery.loading,
    car: carDetail,
    currentUser,
    editCar
  };

  return <CarDetails {...updatedProps} />;
};
export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.carDetail),
      {
        name: 'carDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql(gql(mutations.carsEdit), {
      name: 'carEditMutation',
      options: {
        refetchQueries: ['carsMain', 'carsTotalCount']
      }
    })
  )(CarDetailsContainer)
);
