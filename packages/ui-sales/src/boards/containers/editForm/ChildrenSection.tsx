import React from "react";
import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as dealQueries } from "../../../deals/graphql";
import { withProps } from "@erxes/ui/src/utils";
import { IFilterParams, IOptions } from "../../types";
import { getFilterParams } from "../../utils";
import { DealsQueryResponse } from "../../../deals/types";
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
  dealQueries: DealsQueryResponse;
} & Props;

class ChildrenSection extends React.Component<FinalProps> {
  render() {
    const { type, dealQueries, parentId, options } = this.props;

    let children: any[] = [];
    let refetch;

    if (type === "deal") {
      children = dealQueries.deals;
      refetch = dealQueries.refetch;
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
    graphql<Props>(gql(dealQueries.deals), {
      name: "dealQueries",
      skip: ({ type }) => type !== "deal",
      options: props => commonFilter(props)
    })
  )(ChildrenSection)
);
