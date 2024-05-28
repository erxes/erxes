import { Alert, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

import BasicInfoSection from '../../components/common/BasicInfoSection';
import { mutations, queries } from '../../graphql';
import {
  ICar,
  RemoveMutationResponse,
  RemoveMutationVariables,
  EditMutationResponse,
  ICarDoc,
  CarLoadXypMutationResponse
} from '../../types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  car: ICar;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  RemoveMutationResponse &
  CarLoadXypMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { car, carsRemove, carLoadXyp, history } = props;

  const { _id } = car;

  const remove = () => {
    carsRemove({ variables: { carIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a car');
        history.push('/cars');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
  const sync = () => {
    carLoadXyp({ variables: { _id: car._id } })
      .then(({ data }) => {
        if (data.carLoadXyp?._id) {
          Alert.success('You successfully synced a car');
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    sync
  };

  return <BasicInfoSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['carsMain', 'carCounts', 'carCategoriesCount']
});

export default withProps<Props>(
  compose(
    graphql<
      {},
      RemoveMutationResponse,
      RemoveMutationVariables,
      { _id: string }
    >(gql(mutations.carsRemove), {
      name: 'carsRemove',
      options: generateOptions
    }),
    graphql(gql(mutations.carLoadXyp), {
      name: 'carLoadXyp'
    }),
    graphql(gql(queries.xypDetail), {
      name: 'xyp'
    })
  )(withRouter<FinalProps>(BasicInfoContainer))
);
