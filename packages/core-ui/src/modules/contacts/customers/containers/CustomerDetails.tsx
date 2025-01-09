import {
  PropertyConsumer,
  PropertyProvider
} from "@erxes/ui-contacts/src/customers/propertyContext";
import { gql, useQuery } from "@apollo/client";

import { CustomerDetailQueryResponse } from "@erxes/ui-contacts/src/customers/types";
import CustomerDetails from "../components/detail/CustomerDetails";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries } from "@erxes/ui-contacts/src/customers/graphql";

type Props = {
  id: string;
};

function CustomerDetailsContainer(props: Props) {
  const { id } = props;

  const { loading, data } = useQuery<CustomerDetailQueryResponse>(
    gql(queries.customerDetail),
    {
      variables: { _id: id }
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (!data || !data.customerDetail) {
    return (
      <EmptyState text="Customer not found" image="/images/actions/17.svg" />
    );
  }

  const { customerDetail } = data;

  const taggerRefetchQueries = [
    {
      query: gql(queries.customerDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    customer: customerDetail || ({} as any),
    taggerRefetchQueries
  };

  return (
    <PropertyProvider>
      <PropertyConsumer>
        {({
          deviceFields,
          customerVisibility,
          deviceVisibility,
          customerFields
        }) => {
          return (
            <CustomerDetails
              {...updatedProps}
              deviceFields={deviceFields}
              fields={customerFields}
              fieldsVisibility={customerVisibility}
              deviceFieldsVisibility={deviceVisibility}
            />
          );
        }}
      </PropertyConsumer>
    </PropertyProvider>
  );
}

export default CustomerDetailsContainer;
