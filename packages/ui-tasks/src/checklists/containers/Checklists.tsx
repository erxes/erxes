import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { IItemParams } from "../../boards/types";
import { withProps } from "@erxes/ui/src/utils";
import React, { useEffect } from "react";
import { graphql } from "@apollo/client/react/hoc";
import { queries, subscriptions } from "../graphql";
import { ChecklistsQueryResponse, IChecklistsParam } from "../types";
import List from "./List";

type IProps = {
  contentType: string;
  contentTypeId: string;
  stageId: string;
  addItem: (doc: IItemParams, callback: () => void) => void;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
} & IProps;

function ChecklistsContainer(props: FinalProps) {
  const { checklistsQuery, stageId, addItem, contentType, contentTypeId } =
    props;

  useEffect(() => {
    return checklistsQuery.subscribeToMore({
      document: gql(subscriptions.checklistsChanged),
      variables: { contentType, contentTypeId },
      updateQuery: () => {
        checklistsQuery.refetch();
      }
    });
  });

  const checklists = checklistsQuery.tasksChecklists || [];

  return checklists.map(list => (
    <List
      key={list._id}
      listId={list._id}
      stageId={stageId}
      addItem={addItem}
      refetch={checklistsQuery.refetch}
    />
  ));
}

export default withProps<IProps>(
  compose(
    graphql<IProps, ChecklistsQueryResponse, IChecklistsParam>(
      gql(queries.checklists),
      {
        name: "checklistsQuery",
        options: ({ contentType, contentTypeId }) => ({
          variables: {
            contentType,
            contentTypeId
          },
          refetchQueries: ["checklists"]
        })
      }
    )
  )(ChecklistsContainer)
);
