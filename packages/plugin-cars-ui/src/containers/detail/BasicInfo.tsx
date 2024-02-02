import { gql, useMutation } from '@apollo/client';
import { Alert } from '@erxes/ui/src';
import { mutations } from '../../graphql';
import BasicInfoSection from '../../components/common/BasicInfoSection';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  ICar,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../../types';

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

export default withRouter<Props>(BasicInfoContainer);
