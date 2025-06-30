import * as compose from "lodash.flowright";

import { IItem, IItemParams, IOptions, SaveMutation } from "../../types";
import React from "react";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { renderWithProps } from "@erxes/ui/src/utils";
import { IField } from "@erxes/ui/src/types";

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

  const fieldsGroupsList = fieldsGroupsQuery?.fieldsGroups || [];
  const filteredGroups: typeof fieldsGroupsList = [];

  for (const group of fieldsGroupsList) {
    const { fields = [], ...restGroup } = group;

    const filteredFields: IField[] = [];

    for (const field of fields) {
      if (field.type === "isCheckUserTicket") {
        if (isEnabled("ticket.isCheckUserTicket")) {
          filteredFields.push(field);
        }
      } else {
        filteredFields.push(field);
      }
    }

    if (filteredFields.length > 0) {
      filteredGroups.push({ ...restGroup, fields: filteredFields });
    }
  }

  const updatedProps = {
    save,
    loading,
    isDetail: false,
    object: item,
    customFieldsData: item.customFieldsData,
    fieldsGroups: filteredGroups,
    doc: item,
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
            contentType: `tickets:${options.type}`,
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
