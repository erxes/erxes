import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import React from "react";
import { graphql } from "react-apollo";

import { IUser } from "@erxes/ui/src/auth/types";
import { withProps } from "@erxes/ui/src/utils";
import { AddMutationResponse } from "@erxes/ui-segments/src/types";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IConfig } from "@erxes/ui-settings/src/general/types";
import { queries as integrationQueries } from "@erxes/ui-settings/src/integrations/graphql";
import { IntegrationsQueryResponse } from "@erxes/ui-settings/src/integrations/types";
import {
  EmailTemplatesQueryResponse,
  IEngageMessageDoc,
  IEngageScheduleDate,
  IIntegrationWithPhone,
} from "@erxes/ui-engage/src/types";
import { queries } from "@erxes/ui-engage/src/graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";

import AutoAndManualForm from "../components/AutoAndManualForm";
import FormBase from "../components/FormBase";
import withFormMutations from "./withFormMutations";

type Props = {
  kind?: string;
  brands: IBrand[];
  scheduleDate?: IEngageScheduleDate;
  totalCountQuery?: any;
  segmentType?: string;
};

type FinalProps = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  integrationsConfigsQuery?: any;
  externalIntegrationsQuery?: any;
  integrationsQuery?: any;
  users: IUser[];
  isActionLoading: boolean;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  smsConfig: IConfig;
} & Props &
  AddMutationResponse;

const AutoAndManualFormContainer = (props: FinalProps) => {
  const {
    emailTemplatesQuery,
    integrationsConfigsQuery,
    externalIntegrationsQuery,
    integrationsQuery,
  } = props;

  const configs =
    integrationsConfigsQuery && integrationsConfigsQuery.integrationsGetConfigs
      ? integrationsConfigsQuery.integrationsGetConfigs
      : [];

  const externalIntegrations =
    externalIntegrationsQuery &&
    externalIntegrationsQuery.integrationsGetIntegrations
      ? externalIntegrationsQuery.integrationsGetIntegrations
      : [];

  const integrations =
    integrationsQuery && integrationsQuery.integrations
      ? integrationsQuery.integrations
      : [];

  const mappedIntegrations: IIntegrationWithPhone[] = [];

  for (const ext of externalIntegrations) {
    const locals = integrations.filter(
      (i) => i._id === ext.erxesApiId && i.isActive
    );

    for (const local of locals) {
      mappedIntegrations.push({
        _id: local._id,
        name: local.name,
        phoneNumber: ext.telnyxPhoneNumber,
        isActive: local.isActive,
      });
    }
  }

  const updatedProps = {
    ...props,
    templates: emailTemplatesQuery.emailTemplates || [],
    smsConfig: configs.find((i) => i.code === "TELNYX_API_KEY"),
    integrations: mappedIntegrations,
  };

  const content = (formProps) => (
    <AutoAndManualForm {...updatedProps} {...formProps} />
  );

  return <FormBase kind={props.kind || ""} content={content} />;
};

const withTemplatesQuery = withFormMutations<Props>(
  withProps<Props>(
    compose(
      graphql<Props, EmailTemplatesQueryResponse>(gql(queries.emailTemplates), {
        name: "emailTemplatesQuery",
        options: ({ totalCountQuery }) => ({
          variables: {
            perPage: totalCountQuery.emailTemplatesTotalCount,
          },
        }),
      })
    )(AutoAndManualFormContainer)
  )
);

let composers: any[] = [
  graphql(gql(queries.totalCount), {
    name: "totalCountQuery",
  }),
];

const integrationEnabledQueries = [
  graphql(gql(integrationQueries.integrationsGetConfigs), {
    name: "integrationsConfigsQuery",
  }),
  graphql(gql(integrationQueries.integrationsGetIntegrations), {
    name: "externalIntegrationsQuery",
    options: () => ({
      variables: { kind: "telnyx" },
      fetchPolicy: "network-only",
    }),
  }),
  graphql<Props, IntegrationsQueryResponse>(
    gql(integrationQueries.integrations),
    {
      name: "integrationsQuery",
      options: () => {
        return {
          variables: { kind: "telnyx" },
          fetchPolicy: "network-only",
        };
      },
    }
  ),
];

if (isEnabled("integrations")) {
  composers = composers.concat(integrationEnabledQueries);
}

export default withProps<Props>(compose(composers)(withTemplatesQuery));
