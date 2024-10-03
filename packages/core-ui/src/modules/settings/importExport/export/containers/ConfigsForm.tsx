import * as compose from "lodash.flowright";

import { COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES } from "@erxes/ui-settings/src/constants";
import ConfigsForm from "../components/ConfigsForm";
import React from "react";
import Spinner from "modules/common/components/Spinner";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as commonQueries } from "../../common/graphql";
import { withProps } from "modules/common/utils";
import {
  FieldsCombinedByContentTypeQueryResponse,
  IExportField,
} from "../../types";

type Props = {
  contentType: string;
  onClickField: (column) => void;
};

type State = {};

type FinalProps = {
  fieldsQuery: FieldsCombinedByContentTypeQueryResponse;
} & Props;

class ConfigsFormContainer extends React.Component<FinalProps, State> {
  render() {
    const { fieldsQuery } = this.props;

    if (!fieldsQuery) {
      return <div />;
    }

    if (fieldsQuery.loading) {
      return <Spinner />;
    }

    const columns = (fieldsQuery.fieldsCombinedByContentType || []).map(
      (field) => {
        return {
          ...field,
          _id: Math.random().toString(),
          checked: false,
          order: field.order || 0,
        };
      }
    ) as IExportField[];

    return <ConfigsForm {...this.props} columns={columns} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(commonQueries.fieldsCombinedByContentType), {
      name: "fieldsQuery",
      options: ({ contentType }) => {
        return {
          variables: {
            contentType,
            usageType: "export",
            excludedNames: COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES.EXPORT,
          },
          fetchPolicy: "network-only",
        };
      },
    })
  )(ConfigsFormContainer)
);
