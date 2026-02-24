import * as compose from "lodash.flowright";

import { ICustomer, ICustomerDoc } from "../types";

import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { withProps } from "@erxes/ui/src/utils";
import React from "react";
import CustomersMerge from "../components/detail/CustomersMerge";

type Props = {
  objects: ICustomer[];
  mergeCustomerLoading: boolean;
  save: (doc: {
    ids: string[];
    data: ICustomerDoc;
    callback: () => void;
  }) => void;
  closeModal: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

class CustomersMergeContianer extends React.Component<FinalProps> {
  constructor(props: FinalProps) {
    super(props);
  }

  render() {
    const { fieldsGroupsQuery } = this.props;

    const updatedProps = {
      ...this.props,
      fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    };

    return <CustomersMerge {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: "fieldsGroupsQuery",
        options: () => ({
          variables: {
            contentType: "core:customer",
            isDefinedByErxes: false,
          },
        }),
      },
    ),
  )(CustomersMergeContianer),
);
