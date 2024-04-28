import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  LeadIntegrationDetailQueryResponse,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { mutations, queries } from "@erxes/ui-leads/src/graphql";

import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import { ILeadData } from "@erxes/ui-leads/src/types";
import { ILeadIntegration } from "@erxes/ui-leads/src/types";
import Lead from "../components/Lead";
import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries as settingsQueries } from "@erxes/ui-settings/src/general/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  contentTypeId: string;
  formId: string;
  queryParams: any;
};

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  configsQuery: ConfigsQueryResponse;
} & Props &
  EditIntegrationMutationResponse;

const EditLeadContainer = (props: FinalProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyToSaveForm, setIsReadyToSaveForm] = useState(false);
  const [mustWait, setMustWait] = useState({ optionsStep: false });
  const [isIntegrationSubmitted, setIsIntegrationSubmitted] = useState(false);
  const [doc, setDoc] = useState<{
    brandId: string;
    channelIds?: string[];
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
    visibility?: string;
    departmentIds?: string[];
  }>({} as any);

  useEffect(() => {
    if (Object.keys(doc).length > 0) {
      afterFormDbSave();
    }
  }, [doc]);

  const redirect = () => {
    let canClose = true;

    for (const key in mustWait) {
      if (mustWait[key]) {
        canClose = false;
      } else {
        canClose = true;
      }
    }

    if (canClose) {
      navigate({
        pathname: "/forms",
        search: `?popUpRefetchList=true`,
      });
    }
  };

  const {
    formId,
    integrationDetailQuery,
    editIntegrationMutation,
    emailTemplatesQuery,
    configsQuery,
  } = props;

  if (integrationDetailQuery.loading) {
    return false;
  }

  const integration =
    integrationDetailQuery.integrationDetail || ({} as ILeadIntegration);

  const afterFormDbSave = () => {
    const {
      leadData,
      brandId,
      name,
      languageCode,
      channelIds,
      visibility,
      departmentIds,
    } = doc;

    editIntegrationMutation({
      variables: {
        _id: integration._id,
        formId,
        leadData,
        brandId,
        name,
        languageCode,
        channelIds,
        visibility,
        departmentIds,
      },
    })
      .then(() => {
        Alert.success("You successfully updated a form");

        setIsIntegrationSubmitted(true);
        redirect();
      })

      .catch((error) => {
        Alert.error(error.message);

        setIsReadyToSaveForm(false);
        setIsLoading(false);
      });
  };

  const waitUntilFinish = (obj: any) => {
    const mustWaitObj = { ...mustWait, ...obj };
    setMustWait(mustWaitObj);
  };

  const save = (doc) => {
    setIsReadyToSaveForm(true);
    setIsLoading(true);
    setDoc(doc);
  };

  const updatedProps = {
    ...props,
    integration: integration ? integration : ({} as any),
    integrationId: integration._id,
    save,
    afterFormDbSave,
    waitUntilFinish,
    onChildProcessFinished: (component) => {
      if (mustWait.hasOwnProperty(component)) {
        const mustWaitObj = { ...mustWait };
        mustWait[component] = false;
        setMustWait(mustWaitObj);
      }
      redirect();
    },
    isActionLoading: isLoading,
    isReadyToSaveForm: isReadyToSaveForm,
    isIntegrationSubmitted: isIntegrationSubmitted,
    emailTemplates: emailTemplatesQuery
      ? emailTemplatesQuery.emailTemplates || []
      : [],
    configs: configsQuery.configs || [],
  };

  return <Lead {...updatedProps} currentMode="update" />;
};

const withTemplatesQuery = withProps<FinalProps>(
  compose(
    graphql<FinalProps>(gql(queries.emailTemplates), {
      name: "emailTemplatesQuery",
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount,
        },
      }),
      skip: !isEnabled("engages") ? true : false,
    })
  )(EditLeadContainer)
);

export default withProps<FinalProps>(
  compose(
    graphql(gql(queries.templateTotalCount), {
      name: "emailTemplatesTotalCountQuery",
      skip: !isEnabled("engages") ? true : false,
    }),
    graphql<Props, LeadIntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: "integrationDetailQuery",
        options: ({ contentTypeId }) => ({
          fetchPolicy: "cache-and-network",
          variables: {
            _id: contentTypeId,
          },
        }),
      }
    ),
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: "configsQuery",
    }),
    graphql<
      Props,
      EditIntegrationMutationResponse,
      EditIntegrationMutationVariables
    >(gql(mutations.integrationsEditLeadIntegration), {
      name: "editIntegrationMutation",
      options: {
        refetchQueries: [
          "leadIntegrations",
          "leadIntegrationCounts",
          "formDetail",
        ],
      },
    })
  )(withTemplatesQuery)
);
