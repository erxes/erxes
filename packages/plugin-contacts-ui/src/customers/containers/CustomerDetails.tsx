import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Spinner from "@erxes/ui/src/components/Spinner";
import { withProps } from "@erxes/ui/src/utils";
import { queries as fieldQueries } from "@erxes/ui-settings/src/properties/graphql";
import { InboxFieldsQueryResponse } from "@erxes/ui-settings/src/properties/types";
import React from "react";
import { graphql } from "react-apollo";
import CustomerDetails from "../components/detail/CustomerDetails";
import { queries } from "@erxes/ui-contacts/src/customers/graphql";
import { CustomerDetailQueryResponse } from "@erxes/ui-contacts/src/customers/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { IField } from "@erxes/ui/src/types";

type Props = {
  id: string;
};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
  fieldsInboxQuery: InboxFieldsQueryResponse;
} & Props;

function CustomerDetailsContainer(props: FinalProps) {
  const { id, fieldsInboxQuery, customerDetailQuery } = props;

  if (customerDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!customerDetailQuery.customerDetail) {
    return (
      <EmptyState text="Customer not found" image="/images/actions/17.svg" />
    );
  }

  if (fieldsInboxQuery && fieldsInboxQuery.loading) {
    return <Spinner />;
  }

  const fields = fieldsInboxQuery
    ? fieldsInboxQuery.inboxFields || ({} as any)
    : ([] as IField[]);

  const taggerRefetchQueries = [
    {
      query: gql(queries.customerDetail),
      variables: { _id: id },
    },
  ];

  const updatedProps = {
    ...props,
    customer: customerDetailQuery.customerDetail || ({} as any),
    taggerRefetchQueries,
    fields: fields.customer,
    deviceFields: fields.device,
  };

  return <CustomerDetails {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props, CustomerDetailQueryResponse, { _id: string }>(
      gql(queries.customerDetail),
      {
        name: "customerDetailQuery",
        options: ({ id }) => ({
          variables: {
            _id: id,
          },
        }),
      }
    ),
    graphql<Props, InboxFieldsQueryResponse>(gql(fieldQueries.inboxFields), {
      name: "fieldsInboxQuery",
      skip: !isEnabled("inbox") ? true : false,
    })
  )(CustomerDetailsContainer)
);
