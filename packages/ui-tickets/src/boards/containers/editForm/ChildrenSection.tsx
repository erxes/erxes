import React from "react";
import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as purchaseQueries } from "../../../tickets/graphql";
import { withProps } from "@erxes/ui/src/utils";
import { IFilterParams, IOptions } from "../../types";
import { getFilterParams } from "../../utils";
import { TicketsQueryResponse } from "../../../tickets/types";
import ChildrenSectionComponent from "../../components/editForm/ChildrenSection";

type Props = {
  type: string;
  parentId?: string;
  itemId: string;
  stageId: string;
  queryParams: IFilterParams;
  options: IOptions;
  pipelineId: string;
};

type FinalProps = {
  purchaseQueries: TicketsQueryResponse;
} & Props;

class ChildrenSection extends React.Component<FinalProps> {
  render() {
    const { type, purchaseQueries, parentId, options } = this.props;

    let children: any[] = [];
    let refetch;

    if (type === "purchase") {
      children = purchaseQueries.tickets;
      refetch = purchaseQueries.refetch;
    }

    const updatedProps = {
      ...this.props,
      children,
      parentId: parentId || "",
      options,
      refetch
    };

    return <ChildrenSectionComponent {...updatedProps} />;
  }
}

const commonFilter = ({
  itemId,
  queryParams,
  options
}: {
  itemId: string;
  queryParams: IFilterParams;
  options: IOptions;
}) => ({
  variables: {
    parentId: itemId,
    ...getFilterParams(queryParams, options.getExtraParams),
    hasStartAndCloseDate: false
  }
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(purchaseQueries.tickets), {
      name: "purchaseQueries",
      skip: ({ type }) => type !== "purchase",
      options: props => commonFilter(props)
    })
  )(ChildrenSection)
);
