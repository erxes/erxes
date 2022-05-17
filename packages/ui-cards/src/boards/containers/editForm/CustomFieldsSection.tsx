import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import { IItem, IItemParams, IOptions, SaveMutation } from "../../types";
import Spinner from "@erxes/ui/src/components/Spinner";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import GenerateCustomFields from "@erxes/ui-settings/src/properties/components/GenerateCustomFields";
import { queries as fieldQueries } from "@erxes/ui-settings/src/properties/graphql";
import React from "react";
import { graphql } from "react-apollo";
import { renderWithProps } from "@erxes/ui/src/utils";
import { FieldsGroupsQueryResponse } from "@erxes/ui-settings/src/properties/types";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  options: IOptions;
  loading?: boolean;
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
    customFieldsData: item.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
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
            contentType: `cards:${options.type}`,
            config: {
              boardId: item.boardId || "",
              pipelineId: item.pipeline._id || "",
            },
          },
        }),
        skip: !isEnabled("forms") ? true : false,
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
