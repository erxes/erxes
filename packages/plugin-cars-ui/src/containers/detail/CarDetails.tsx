import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { EmptyState, Spinner, withCurrentUser, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import CarDetails from '../../components/detail/CarDetails';
import { queries } from '../../graphql';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { DetailQueryResponse } from '../../types';

type Props = {
  id: string;
  currentUser: IUser;
};

const CarDetailsContainer = (props: Props) => {
  const { id, currentUser } = props;

  const carDetailQuery = useQuery<DetailQueryResponse>(gql(queries.carDetail), {
    variables: {
      _id: id,
    },
  });

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: 'cars:car',
        isDefinedByErxes: false,
      },
    },
  );

  if (carDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!carDetailQuery?.data?.carDetail) {
    return <EmptyState text="Car not found" image="/images/actions/24.svg" />;
  }

  const carDetail = carDetailQuery?.data?.carDetail;

  const updatedProps = {
    ...props,
    loading: carDetailQuery.loading,
    car: carDetail,
    currentUser,
    fieldsGroups: fieldsGroupsQuery
      ? fieldsGroupsQuery?.data?.fieldsGroups
      : [],
  };

  return <CarDetails {...updatedProps} />;
};

export default withCurrentUser(CarDetailsContainer);
