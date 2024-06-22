import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import {
  PutResponseReturnBillMutationResponse,
  PutResponsesDuplicatedDetailQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";

import DetailDuplicated from "../components/DetailDuplicated";
import React from "react";
import { Spinner } from "@erxes/ui/src/components";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  contentId: string;
  taxType: string;
};

type FinalProps = {
  putResponsesQuery: PutResponsesDuplicatedDetailQueryResponse;
} & Props &
  PutResponseReturnBillMutationResponse;

type State = {
  loading: boolean;
};

class DetailDuplicatedContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  returnBill = (_id: string) => {
    const { putResponseReturnBill } = this.props;

    putResponseReturnBill({
      variables: { _id },
    })
      .then(() => {
        Alert.success("You successfully returned bill.");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  render() {
    const { putResponsesQuery } = this.props;

    if (putResponsesQuery.loading) {
      return <Spinner />;
    }

    const putResponses = putResponsesQuery.putResponsesDuplicatedDetail || [];

    const updatedProps = {
      ...this.props,
      putResponses,
      loading: putResponsesQuery.loading,
      onReturnBill: this.returnBill,
    };

    return <DetailDuplicated {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { contentId: string; taxType: string },
      PutResponsesDuplicatedDetailQueryResponse,
      {}
    >(gql(queries.putResponsesDuplicatedDetail), {
      name: "putResponsesQuery",
      options: ({ contentId, taxType }) => ({
        variables: { contentId, taxType },
        fetchPolicy: "network-only",
      }),
    }),
    graphql<Props, PutResponseReturnBillMutationResponse, { _id: string }>(
      gql(mutations.putResponseReturnBill),
      {
        name: "putResponseReturnBill",
      }
    )
  )(DetailDuplicatedContainer)
);
