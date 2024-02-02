import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src';
import {
  ICar,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../../types';
import { mutations, queries } from '../../graphql';

import BasicInfoSection from '../../components/common/BasicInfoSection';
import { IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  car: ICar;
} & IRouterProps;

const BasicInfoContainer = (props: Props) => {
  const { car, history } = props;

  const [carsRemove] = useMutation<
    RemoveMutationResponse,
    RemoveMutationVariables
  >(gql(mutations.carsRemove), {
    refetchQueries: ['carsMain', 'carCounts', 'carCategoriesCount'],
  });

  const { _id } = car;

  const remove = () => {
    carsRemove({ variables: { carIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a car');
        history.push('/cars');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfoSection {...updatedProps} />;
};

export default BasicInfoContainer;

// export default withRouter<Props>(BasicInfoContainer);
