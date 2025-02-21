import * as compose from "lodash.flowright";
import * as routerUtils from "@erxes/ui/src/utils/router";

import { DetailQueryResponse, IOptions } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

import { EditForm } from "./editForm";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";

type WrapperProps = {
  itemId: string;
  options: IOptions;
};

type FinalProps = WrapperProps & {
  detailQuery: DetailQueryResponse;
};

const InvisibleItemInUrl = (props: FinalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const beforePopupClose = () => {
    routerUtils.removeParams(navigate, location, "itemId", "isFull");
  };

  const { options, itemId, detailQuery } = props;

  if (detailQuery.loading) {
    return null;
  }

  const item = detailQuery[options.queriesName.detailQuery];

  if (!item) {
    return null;
  }

  return (
    <EditForm
      itemId={itemId}
      options={options}
      isPopupVisible={true}
      stageId={item.stageId}
      hideHeader={true}
      beforePopupClose={beforePopupClose}
    />
  );
};

const withQuery = (props: WrapperProps) => {
  const { options } = props;

  return withProps<WrapperProps>(
    compose(
      graphql<WrapperProps, DetailQueryResponse, { _id: string }>(
        gql(options.queries.detailQuery),
        {
          name: "detailQuery",
          options: ({ itemId }: { itemId: string }) => {
            return {
              variables: {
                _id: itemId,
              },
              fetchPolicy: "network-only",
            };
          },
        }
      )
    )(InvisibleItemInUrl)
  );
};

export default class WithData extends React.Component<WrapperProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery(props);
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}
