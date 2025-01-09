import { Info } from "@erxes/ui/src/styles/main";
import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import Spinner from "modules/common/components/Spinner";

import { withProps, __ } from "modules/common/utils";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import {
  IContentType,
  ImportHistoryGetDuplicatedHeadersQueryResponse,
} from "../../types";
import AccociateForm from "../components/AccociateForm";
import { queries } from "../graphql";

type Props = {
  attachmentNames: string[];
  contentTypes: IContentType[];
  onChangeAssociateHeader: (value: string) => void;
  onChangeAssociateContentType: (value: string) => void;
};

type FinalProps = {
  importHistoryGetDuplicatedHeaders: ImportHistoryGetDuplicatedHeadersQueryResponse;
} & Props;

class AccociateFormContainer extends React.Component<FinalProps> {
  render() {
    const { importHistoryGetDuplicatedHeaders } = this.props;

    if (!importHistoryGetDuplicatedHeaders) {
      return <Info>{__("You must choose two objects")}</Info>;
    }

    if (importHistoryGetDuplicatedHeaders.loading) {
      return <Spinner />;
    }

    const duplicatedHeaders =
      importHistoryGetDuplicatedHeaders.importHistoryGetDuplicatedHeaders
        .attachmentNames || [];

    return (
      <AccociateForm {...this.props} duplicatedHeaders={duplicatedHeaders} />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.importHistoryGetDuplicatedHeaders), {
      name: "importHistoryGetDuplicatedHeaders",
      skip: ({ attachmentNames }) => attachmentNames.length < 2,
      options: ({ attachmentNames }) => {
        return {
          variables: {
            attachmentNames,
          },
        };
      },
    })
  )(AccociateFormContainer)
);
