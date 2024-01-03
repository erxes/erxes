import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';

import BuildingDetail from '../components/detail/Detail';
import { queries, mutations } from '../graphql';

type Props = {
  id: string;
};

const BuildingDetailContainer = (props: Props) => {
  const { id } = props;

  const [updateBuilding] = useMutation(gql(mutations.buildingsUpdate));

  const detailQry = useQuery(gql(queries.detailQuery), {
    variables: {
      _id: id
    },
    fetchPolicy: 'network-only'
  });

  const assetsQuery: any = useQuery(gql(queries.assets), {
    fetchPolicy: 'network-only'
  });

  const onUpdate = (data: any) => {
    updateBuilding({
      variables: {
        _id: id,
        ...data
      }
    }).then(() => {
      detailQry.refetch();
    });
  };

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
    onUpdate,
    building: detailQry.data.buildingDetail || ({} as any),
    assets: (assetsQuery.data || {}).assets || []
  };

  return <BuildingDetail {...updatedProps} />;
};

export default BuildingDetailContainer;
