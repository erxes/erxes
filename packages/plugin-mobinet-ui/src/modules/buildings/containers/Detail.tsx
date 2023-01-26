import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import BuildingDetail from '../components/detail/Detail';
import { queries } from '../graphql';

type Props = {
  id: string;
};

const BuildingDetailContainer = (props: Props) => {
  const { id } = props;

  const detailQry = useQuery(gql(queries.detailQuery), {
    variables: {
      _id: id
    },
    fetchPolicy: 'network-only'
  });

  if (detailQry.loading) {
    return <Spinner objective={true} />;
  }

  if (!detailQry.data.buildingDetail) {
    return (
      <EmptyState text="Building not found" image="/images/actions/17.svg" />
    );
  }

  const updatedProps = {
    ...props,
    building: detailQry.data.buildingDetail || ({} as any)
  };

  return <BuildingDetail {...updatedProps} />;
};

export default BuildingDetailContainer;
