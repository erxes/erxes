import * as compose from "lodash.flowright";

import { IItem, IItemParams, IOptions, SaveMutation } from "../../types";

import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { renderWithProps } from "@erxes/ui/src/utils";

type Props = {
  item: IItem;
  options: IOptions;
  loading?: boolean;
  showType?: string;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  editMutation: SaveMutation;
} & Props;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, item, fieldsGroupsQuery, editMutation } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = item;

  const save = (data, callback) => {
    editMutation({
      variables: { _id, ...data },
    })
      .then(() => {
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    isDetail: false,
    object: item,
    customFieldsData: item.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    doc: item,
    showType: props.showType,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default (props: Props) => {
  const { options, item } = props;

  return renderWithProps<Props>(
    props,
    compose(
      graphql<
        Props,
        FieldsGroupsQueryResponse,
        { contentType: string; config: { boardId: string } }
      >(gql(fieldQueries.fieldsGroups), {
        name: "fieldsGroupsQuery",
        options: () => ({
          variables: {
            contentType: `sales:${options.type}`,
            config: {
              boardId: item.boardId || "",
              pipelineId: item.pipeline._id || "",
            },
          },
        }),
      }),
      graphql<Props, SaveMutation, IItemParams>(
        gql(options.mutations.editMutation),
        {
          name: "editMutation",
        }
      )
    )(CustomFieldsSection)
  );
};
