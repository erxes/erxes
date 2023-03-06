import * as compose from 'lodash.flowright';

import {
  PropertyConsumer,
  PropertyProvider
} from '@erxes/ui-contacts/src/customers/propertyContext';

import { CustomerDetailQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui-contacts/src/customers/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
} & Props;

function SidebarContainer(props: FinalProps) {
  // const { customerDetailQuery } = props;

  // if (customerDetailQuery.loading) {
  //   return <Spinner objective={true} />;
  // }

  // if (!customerDetailQuery.customerDetail) {
  //   return (
  //     <EmptyState text="Customer not found" image="/images/actions/17.svg" />
  //   );
  // }

  // const taggerRefetchQueries = [
  //   {
  //     query: gql(queries.customerDetail),
  //     variables: { _id: id },
  //   },
  // ];

  // const updatedProps = {
  //   ...props,
  //   customer: customerDetailQuery.customerDetail || ({} as any),
  //   taggerRefetchQueries,
  // };

  return <Sidebar />;
}

export default withProps<Props>(
  compose(
    graphql<Props, CustomerDetailQueryResponse, { _id: string }>(
      gql(queries.customerDetail),
      {
        name: 'customerDetailQuery'
        // options: ({ id }) => ({
        //   variables: {
        //     _id: id,
        //   },
        // }),
      }
    )
  )(SidebarContainer)
);
