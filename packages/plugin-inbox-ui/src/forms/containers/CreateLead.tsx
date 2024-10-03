import * as compose from "lodash.flowright";

import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { Alert, withProps } from "@erxes/ui/src/utils";
import React, { useState, useEffect } from "react";
import { mutations, queries } from "@erxes/ui-leads/src/graphql";

import { AddFieldsMutationResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import { ILeadData } from "@erxes/ui-leads/src/types";
import Lead from "../components/Lead";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries as settingsQueries } from "@erxes/ui-settings/src/general/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  configsQuery: ConfigsQueryResponse;
} & AddIntegrationMutationResponse &
  AddFieldsMutationResponse;

type State = {
  isLoading: boolean;
  isReadyToSaveForm: boolean;
  isIntegrationSubmitted: boolean;
  integrationId?: string;
  mustWait?: any;
  doc?: {
    brandId: string;
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
    channelIds?: string[];
  };
};

const CreateLeadContainer: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  const [state, setState] = useState<State>({
    isLoading: false,
    isReadyToSaveForm: false,
    isIntegrationSubmitted: false,
    mustWait: { optionsStep: false },
  });
  const [id, setId] = useState('')

  useEffect(() => {
    if (state.doc && state.isReadyToSaveForm && id !== '') {
      afterFormDbSave();
    }
  }, [state.doc, state.isReadyToSaveForm, id]);

  const redirect = () => {
    let canClose = true;

    for (const key in state.mustWait) {
      if (state.mustWait[key]) {
        canClose = false;
      } else {
        canClose = true;
      }
    }

    if (canClose) {
      navigate({
        pathname: "/forms/leads",
        search: `?popUpRefetchList=true&showInstallCode=${state.integrationId}`,
      });
    }
  };

  const afterFormDbSave = () => {
    setState({ ...state, isReadyToSaveForm: false });

    if (state.doc) {
      const { leadData, brandId, name, languageCode, channelIds } = state.doc;

      props
        .addIntegrationMutation({
          variables: {
            formId: id,
            leadData,
            brandId,
            name,
            languageCode,
            channelIds,
          },
        })
        .then(
          ({
            data: {
              integrationsCreateLeadIntegration: { _id },
            },
          }) => {
            setState({
              ...state,
              integrationId: _id,
              isIntegrationSubmitted: true,
            });
            Alert.success("You successfully added a form");

            redirect();
          }
        )
        .catch((error) => {
          Alert.error(error.message);

          setState({ ...state, isLoading: false });
        });
    }
  };

  const waitUntilFinish = (obj: any) => {
    const mustWait = { ...state.mustWait, ...obj };
    setState({ ...state, mustWait });
  };

  const save = (doc) => {
    setState({ ...state, isLoading: true, isReadyToSaveForm: true, doc: doc });
  };

  const updatedProps = {
    ...props,
    fields: [],
    save,
    afterFormDbSave: id => setId(id),
    waitUntilFinish,
    onChildProcessFinished: (component) => {
      if (state.mustWait.hasOwnProperty(component)) {
        const mustWait = { ...state.mustWait };
        mustWait[component] = false;
        setState({ ...state, mustWait });
      }

      redirect();
    },
    isActionLoading: state.isLoading,
    isReadyToSaveForm: state.isReadyToSaveForm,
    isIntegrationSubmitted: state.isIntegrationSubmitted,
    emailTemplates: props.emailTemplatesQuery
      ? props.emailTemplatesQuery.emailTemplates || []
      : [],
    configs: props.configsQuery.configs || [],
    integrationId: state.integrationId,
  };

  return <Lead {...updatedProps} currentMode="create" />;
};

const withTemplatesQuery = withProps<Props>(
  compose(
    graphql<Props>(gql(queries.emailTemplates), {
      name: "emailTemplatesQuery",
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount,
        },
      }),
      skip: !isEnabled("engages") ? true : false,
    })
  )(CreateLeadContainer)
);

export default withProps<Props>(
  compose(
    graphql(gql(queries.templateTotalCount), {
      name: "emailTemplatesTotalCountQuery",
      skip: !isEnabled("engages") ? true : false,
    }),
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: "configsQuery",
    }),
    graphql<
      {},
      AddIntegrationMutationResponse,
      AddIntegrationMutationVariables
    >(gql(mutations.integrationsCreateLeadIntegration), {
      name: "addIntegrationMutation",
    })
  )(withTemplatesQuery)
);
