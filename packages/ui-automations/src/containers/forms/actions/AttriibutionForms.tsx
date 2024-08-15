import * as compose from "lodash.flowright";

import { ISegment } from "@erxes/ui-segments/src/types";
import { QueryResponse } from "@erxes/ui/src/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as segmentQueries } from "@erxes/ui-segments/src/graphql";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  segmentId: string;
  children: any;
};

type FinalProps = {
  segmentDetailQuery: { segmentDetail: ISegment } & QueryResponse;
} & Props;

class AttributesForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { segmentDetailQuery, children } = this.props;

    const { segmentDetail, loading, error } = segmentDetailQuery || {};

    if (loading || error) {
      return "";
    }

    let config = segmentDetail?.config || {};

    if (
      !(segmentDetail?.subSegmentConditions || [])?.some((subCondition) =>
        (subCondition?.conditions || []).some((cond) =>
          ["forms:form_submission"].includes(cond.propertyType || "")
        )
      )
    ) {
      config = undefined;
    }

    return children(segmentDetail?.config || {});
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(segmentQueries.segmentDetail), {
      name: "segmentDetailQuery",
      options: ({ segmentId }) => ({
        variables: {
          _id: segmentId,
        },
      }),
    })
  )(AttributesForm)
);
