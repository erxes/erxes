import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { router, withProps } from '@erxes/ui/src/utils';
import { Counts } from '@erxes/ui/src/types';
import { ClientPortalConfigsQueryResponse, IClientPortalUser } from '../types';
import { queries } from '../graphql';
import ClientPortalIdFilter from '../components/list/ClientPortalIdFilter';

type Props = {
  counts: Counts;
  clientPortalUsers: IClientPortalUser[];
};

type FinalProps = {
  clientPortalConfigsQuery?: ClientPortalConfigsQueryResponse;
} & Props;

class ClientPortalIdFilterContainer extends React.Component<FinalProps> {
  render() {
    const { clientPortalConfigsQuery, counts, clientPortalUsers } = this.props;

    const updatedProps = {
      ...this.props,
      clientPortalGetConfigs:
        (clientPortalConfigsQuery
          ? clientPortalConfigsQuery.clientPortalGetConfigs
          : null) || [],
      loading:
        (clientPortalConfigsQuery ? clientPortalConfigsQuery.loading : null) ||
        false,
      counts: counts || {},
      clientPortalUsers
    };

    return <ClientPortalIdFilter {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ClientPortalConfigsQueryResponse>(gql(queries.getConfigs), {
      name: 'clientPortalConfigsQuery'
    })
  )(ClientPortalIdFilterContainer)
);
