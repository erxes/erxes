import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery, useMutation } from 'react-apollo';

import BuildingDetail from '../components/detail/Detail';
import { queries, mutations } from '../graphql';

type Props = {
  id: string;
};

const BuildingDetailContainer = (props: Props) => {
  const { id } = props;

  const [manageCustomers] = useMutation(
    gql(mutations.buildingsAddCustomersMutation),
    {
      variables: {
        _id: id,
        customerIds: []
      }
    }
  );

  const [manageCompanies] = useMutation(
    gql(mutations.buildingsAddCompaniesMutation),
    {
      variables: {
        _id: id,
        companyIds: []
      }
    }
  );

  const detailQry = useQuery(gql(queries.detailQuery), {
    variables: {
      _id: id
    },
    fetchPolicy: 'network-only'
  });

  const onSelectContacts = (datas: any, type: string) => {
    console.log('onSelect', datas);
    if (type === 'customer') {
      manageCustomers({
        variables: {
          _id: id,
          customerIds: datas.map((d: any) => d._id)
        }
      }).then(() => {
        detailQry.refetch();
      });
    }

    if (type === 'company') {
      manageCompanies({
        variables: {
          _id: id,
          companyIds: datas.map((d: any) => d._id)
        }
      }).then(() => {
        detailQry.refetch();
      });
    }
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
    onSelectContacts,
    building: detailQry.data.buildingDetail || ({} as any)
  };

  return <BuildingDetail {...updatedProps} />;
};

export default BuildingDetailContainer;
