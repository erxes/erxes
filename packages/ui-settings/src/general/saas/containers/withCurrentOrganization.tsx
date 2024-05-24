import * as compose from "lodash.flowright";

import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";

type Props = {
  currentOrganizationQuery: any;
};

const withCurrentOrganization = (Component) => {
  const Container = (props: Props) => {
    const { currentOrganizationQuery } = props;

    if (currentOrganizationQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...props,
      currentOrganization:
        currentOrganizationQuery.chargeCurrentOrganization || {},
    };

    return <Component {...extendedProps} />;
  };

  return compose(
    graphql(gql(queries.chargeCurrentOrganization), {
      name: "currentOrganizationQuery",
      options: {
        fetchPolicy: "network-only",
      },
    })
  )(Container);
};

export default withCurrentOrganization;
