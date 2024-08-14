import * as compose from "lodash.flowright";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import CategoryForm from "../components/CategoryForm";
import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-forms/src/settings/properties/constants";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IProductCategory } from "../types";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  categories: IProductCategory[];
  category?: IProductCategory;
  closeModal: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

class CategoryFormContainer extends React.Component<FinalProps> {
  render() {
    const { fieldsGroupsQuery } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object,
    }: IButtonMutateProps) => {
      const attachment = values.attachment || undefined;

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;

      return (
        <ButtonMutate
          mutation={
            object
              ? mutations.productCategoryEdit
              : mutations.productCategoryAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? "updated" : "added"
          } a ${name}`}
        />
      );
    };

    if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
      return <Spinner />;
    }

    const fieldGroups = fieldsGroupsQuery?.fieldsGroups ?? [];

    const updatedProps = {
      ...this.props,
      renderButton,
      fieldGroups,
    };

    return <CategoryForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ["productCategories", "productCategoriesTotalCount", "products"];
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: "fieldsGroupsQuery",
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
            isDefinedByErxes: false,
            config: {},
          },
        }),
      }
    )
  )(CategoryFormContainer)
);
