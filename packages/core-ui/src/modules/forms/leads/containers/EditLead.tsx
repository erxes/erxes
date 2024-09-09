import { Alert } from "@erxes/ui/src/utils";
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  IIntegration,
  LeadIntegrationDetailQueryResponse,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import Lead from "../components/LeadForm";
import React, { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { useNavigate } from "react-router-dom";
import { ILeadData } from "../../types";
import queries from "../../queries";
import mutations from "../../mutations";

type Props = {
  contentTypeId: string;
  formId: string;
  queryParams: any;
};

const EditLeadContainer = ({ contentTypeId, formId }: Props) => {
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

  const { data: integrationDetailData, loading: integrationLoading } = useQuery<LeadIntegrationDetailQueryResponse>(
    gql(queries.integrationDetail),
    {
      variables: { _id: contentTypeId },
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: emailTemplatesTotalCountData } = useQuery(
    gql(queries.templateTotalCount),
    {
      skip: !isEnabled('engages'),
    }
  );

  const { data: emailTemplatesData } = useQuery(gql(queries.emailTemplates), {
    skip: !isEnabled('engages') || !emailTemplatesTotalCountData,
    variables: {
      perPage: emailTemplatesTotalCountData?.emailTemplatesTotalCount || 0,
    },
  });

  const { data: configsData } = useQuery<ConfigsQueryResponse>(gql(settingsQueries.configs));

  const [editIntegrationMutation] = useMutation<
    EditIntegrationMutationResponse,
    EditIntegrationMutationVariables
  >(gql(mutations.integrationsEditLeadIntegration), {
    refetchQueries: ["leadIntegrations", "leadIntegrationCounts", "formDetail"],
  });

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
      }
    }

    if (canClose) {
      navigate({
        pathname: "/forms",
        search: `?popUpRefetchList=true`,
      });
    }
  };

  if (integrationLoading) {
    return false;
  }

  const integration = integrationDetailData?.integrationDetail || ({} as IIntegration);

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
    integration: integration || ({} as any),
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
    emailTemplates: emailTemplatesData?.emailTemplates || [],
    configs: configsData?.configs || [],
  };

  return <Lead {...updatedProps} currentMode="update" />;
};

export default EditLeadContainer;
