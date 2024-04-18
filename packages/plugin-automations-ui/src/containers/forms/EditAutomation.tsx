import * as compose from "lodash.flowright";

import { Alert, router, withProps } from "@erxes/ui/src/utils";
import {
  AutomationConstantsQueryResponse,
  AutomationsNoteQueryResponse,
  DetailQueryResponse,
  EditMutationResponse,
  IAutomation,
} from "../../types";
import React, { useState } from "react";
import { mutations, queries } from "../../graphql";

import AutomationForm from "../../components/editor/Main";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IUser } from "@erxes/ui/src/auth/types";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  id: string;
  queryParams: any;
  navigate: any;
  location: any;
};

type FinalProps = {
  automationDetailQuery: DetailQueryResponse;
  automationNotesQuery: AutomationsNoteQueryResponse;
  automationConstantsQuery: AutomationConstantsQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  EditMutationResponse;

const AutomationDetailsContainer = (props: FinalProps) => {
  const {
    automationDetailQuery,
    automationNotesQuery,
    currentUser,
    navigate,
    location,
    editAutomationMutation,
    automationConstantsQuery,
  } = props;

  const [saveLoading, setLoading] = useState(false);

  const save = (doc: IAutomation) => {
    setLoading(true);

    editAutomationMutation({
      variables: {
        ...doc,
      },
    })
      .then(() => {
        router.removeParams(navigate, location, "isCreate");

        setTimeout(() => {
          setLoading(false);
        }, 300);

        Alert.success(`You successfully updated a ${doc.name || "status"}`);
      })

      .catch((error) => {
        Alert.error(error.message);
      });
  };

  if (
    automationDetailQuery.loading ||
    automationNotesQuery.loading ||
    automationConstantsQuery.loading
  ) {
    return <Spinner objective={true} />;
  }

  if (!automationDetailQuery.automationDetail) {
    return (
      <EmptyState text="Automation not found" image="/images/actions/24.svg" />
    );
  }

  const automationDetail = automationDetailQuery.automationDetail;
  const automationNotes = automationNotesQuery.automationNotes || [];
  const constants = automationConstantsQuery.automationConstants || {};

  const updatedProps = {
    ...props,
    loading: automationDetailQuery.loading,
    automation: automationDetail,
    automationNotes,
    currentUser,
    save,
    saveLoading,
    constants,
  };

  return <AutomationForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.automationDetail),
      {
        name: "automationDetailQuery",
        options: ({ id }) => ({
          variables: {
            _id: id,
          },
        }),
      }
    ),
    graphql<Props, AutomationsNoteQueryResponse, { automationId: string }>(
      gql(queries.automationNotes),
      {
        name: "automationNotesQuery",
        options: ({ id }) => ({
          variables: {
            automationId: id,
          },
        }),
      }
    ),
    graphql<{}, EditMutationResponse, IAutomation>(
      gql(mutations.automationsEdit),
      {
        name: "editAutomationMutation",
        options: () => ({
          refetchQueries: [
            "automations",
            "automationsMain",
            "automationDetail",
          ],
        }),
      }
    ),
    graphql<AutomationConstantsQueryResponse>(
      gql(queries.automationConstants),
      {
        name: "automationConstantsQuery",
      }
    )
  )(AutomationDetailsContainer)
);
