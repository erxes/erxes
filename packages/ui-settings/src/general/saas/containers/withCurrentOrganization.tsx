import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';

type Props = {
  currentOrganizationQuery: any;
};

const withCurrentOrganization = (Component) => {
  const Container = (props: Props) => {
    const { currentOrganizationQuery } = props;

    if (currentOrganizationQuery.loading) {
      return <Spinner />;
    }

    console.log(currentOrganizationQuery);

    const extendedProps = {
      ...props,
      currentOrganization:
        currentOrganizationQuery.chargeCurrentOrganization || {},
    };

    return <Component {...extendedProps} />;
  };

  return compose(
    graphql(gql(queries.chargeCurrentOrganization), {
      name: 'currentOrganizationQuery',
      options: {
        fetchPolicy: 'network-only',
      },
    }),
  )(Container);
};

export default withCurrentOrganization;
