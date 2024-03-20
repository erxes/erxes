import { Button, ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React, { useState } from 'react';
import { graphql } from '@apollo/client/react/hoc';

import CarForm from '../components/list/CarForm';
import { mutations, queries } from '../graphql';
import {
  CarCategoriesQueryResponse,
  ICar,
  MainQueryResponse,
  XypRequestQueryResponse
} from '../types';
import ManageDataForm from '../components/list/ManageDataForm';

type Props = {
  car: ICar;
  getAssociatedCar?: (carId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  carsMainQuery: MainQueryResponse;
  xypRequest: (params: { variables: any }) => Promise<any>;
} & Props;

const ManageDataFormContainer = (props: FinalProps) => {
  const { carsMainQuery } = props;

  const [xypRequest] = useLazyQuery(gql(queries.xypRequest));
  const [addOrEdit] = useMutation(gql(mutations.xypDataCreateOrUpdate));
  const [carLoadXyp] = useMutation(gql(mutations.carLoadXyp));
  const [loadCarList, {}] = useLazyQuery(gql(queries.carsMain));
  const [successCount, setSuccessCount] = useState(0);
  const [loopCount, setLoopCount] = useState(0);

  const loadManageMethod = async () => {
    let page = 1;

    while (true) {
      const carlist = await loadCarList({
        variables: { page, perPage: 50 }
      });
      const length = carlist.data?.carsMain?.list?.length;
      for (const s of carlist.data?.carsMain?.list) {
        try {
          const response = await xypRequest({
            variables: {
              wsOperationName: 'WS100401_getVehicleInfo',
              params: {
                plateNumber: s.plateNumber
              }
            }
          });

          if (response.data?.xypRequest?.return?.resultCode === 0) {
            const xypData = {
              serviceName: 'WS100401_getVehicleInfo',
              serviceDescription:
                'Тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
              data: response.data?.xypRequest?.return?.response
            };

            const response2 = await addOrEdit({
              variables: {
                contentType: 'tumentech:car',
                contentTypeId: s._id,
                data: xypData
              }
            });
            if (response2?.data?.xypDataCreateOrUpdate?._id) {
              const response3 = await carLoadXyp({
                variables: {
                  _id: s._id
                }
              });
              if (response3.data?.carLoadXyp?._id) {
                setSuccessCount(v => v + 1);
              }
            }
          }
          setLoopCount(v => v + 1);
        } catch (e) {
          setLoopCount(v => v + 1);

          console.log('error data manage');
          console.log(e);
        }
      }
      if (length < 20) {
        break;
      }
      page = page + 1;
    }
  };

  if (carsMainQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,

    carsQuery: carsMainQuery,
    successCount,
    loopCount,
    loadManageMethod
  };
  return <ManageDataForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'carsMain',
    'carDetail',
    'cars',
    'carCounts',
    'carCategories',
    'carCategoriesTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse>(gql(queries.carsMain), {
      name: 'carsMainQuery'
    })
  )(ManageDataFormContainer)
);
