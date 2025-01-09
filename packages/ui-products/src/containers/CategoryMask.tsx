import * as compose from "lodash.flowright";

import CategoryMask from "../components/CategoryMask";
import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-forms/src/settings/properties/constants";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { IProductCategory } from "../types";
import React from "react";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  parentCategory?: IProductCategory;
  categoryId?: string;
  code: string;
  maskType: string;
  mask: any;
  changeCode: (code: string) => void;
  changeMask: (mask: any) => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

class CategoryMaskContainer extends React.Component<FinalProps> {
  render() {
    const { fieldsGroupsQuery } = this.props;

    if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
      return null;
    }

    const fieldGroups = fieldsGroupsQuery?.fieldsGroups ?? [];

    const updatedProps = {
      ...this.props,
      fieldGroups,
    };

    return <CategoryMask {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: "fieldsGroupsQuery",
        options: ({ parentCategory, categoryId }) => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
            isDefinedByErxes: false,
            config: {
              categoryId: parentCategory?._id || categoryId,
              isChosen: true,
            },
          },
        }),
      }
    )
  )(CategoryMaskContainer)
);
