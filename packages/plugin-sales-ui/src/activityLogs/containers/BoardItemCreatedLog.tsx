import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";

import { withProps } from "@erxes/ui/src/utils";
import { queries } from "@erxes/ui-sales/src/boards/graphql";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import Spinner from "@erxes/ui/src/components/Spinner";
import BoardItemCreatedLog from "../components/BoardItemCreatedLog";

type Props = {
  activity: any;
};

type FinalProps = {
  contentTypeDetailsQuery: any;
} & Props;

class BoardItemCreatedLogContainer extends React.Component<FinalProps> {
  render() {
    const { contentTypeDetailsQuery } = this.props;

    if (contentTypeDetailsQuery.loading) {
      return <Spinner />;
    }

    const contentDetail =
      contentTypeDetailsQuery.salesBoardContentTypeDetail || {};

    const updatedProps = {
      ...this.props,
      contentDetail
    };

    return <BoardItemCreatedLog {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.boardContentTypeDetail), {
      name: "contentTypeDetailsQuery",
      options: ({ activity }) => ({
        variables: {
          contentType: activity.contentType.split(":")[1],
          contentId: activity._id
        }
      })
    })
  )(BoardItemCreatedLogContainer)
);
