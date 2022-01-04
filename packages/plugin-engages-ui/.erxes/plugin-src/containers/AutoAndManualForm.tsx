import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import { withProps } from '@erxes/ui/src/utils';
import { AddMutationResponse } from '@erxes/ui/src/settings/segments/types';
import { IBrand } from '@erxes/ui/src/settings/brands/types';
import { EmailTemplatesQueryResponse } from '@erxes/ui/src/settings/emailTemplates/types';
import { queries } from '@erxes/ui/src/settings/emailTemplates/graphql';
import { IConfig } from '@erxes/ui/src/settings/general/types';
import { queries as integrationQueries } from '@erxes/ui/src/settings/integrations/graphql';
import { IntegrationsQueryResponse } from '@erxes/ui/src/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import AutoAndManualForm from '../components/AutoAndManualForm';
import FormBase from '../components/FormBase';
import {
  IEngageMessageDoc,
  IEngageScheduleDate,
  IIntegrationWithPhone
} from '../types';
import withFormMutations from './withFormMutations';

type Props = {
  kind?: string;
  brands: IBrand[];
  scheduleDate?: IEngageScheduleDate;
  totalCountQuery?: any;
  segmentType?: string;
};

type FinalProps = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  integrationConfigsQuery: any;
  externalIntegrationsQuery: any;
  integrationsQuery: any;
  users: IUser[];
  isActionLoading: boolean;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  smsConfig: IConfig;
} & Props &
  AddMutationResponse;

const AutoAndManualFormContainer = (props: FinalProps) => {
  const {
    emailTemplatesQuery,
    integrationConfigsQuery,
    externalIntegrationsQuery,
    integrationsQuery
  } = props;

  const configs = integrationConfigsQuery.integrationsFetchApi || [];
  const externalIntegrations =
    externalIntegrationsQuery.integrationsFetchApi || [];
  const integrations = integrationsQuery.integrations || [];

  const mappedIntegrations: IIntegrationWithPhone[] = [];

  for (const ext of externalIntegrations) {
    const locals = integrations.filter(
      i => i._id === ext.erxesApiId && i.isActive
    );

    for (const local of locals) {
      mappedIntegrations.push({
        _id: local._id,
        name: local.name,
        phoneNumber: ext.telnyxPhoneNumber,
        isActive: local.isActive
      });
    }
  }

  const updatedProps = {
    ...props,
    templates: emailTemplatesQuery.emailTemplates || [],
    smsConfig: configs.find(i => i.code === 'TELNYX_API_KEY'),
    integrations: mappedIntegrations
  };

  const content = formProps => (
    <AutoAndManualForm {...updatedProps} {...formProps} />
  );

  return <FormBase kind={props.kind || ''} content={content} />;
};

const withTemplatesQuery = withFormMutations<Props>(
  withProps<Props>(
    compose(
      graphql<Props, EmailTemplatesQueryResponse>(gql(queries.emailTemplates), {
        name: 'emailTemplatesQuery',
        options: ({ totalCountQuery }) => ({
          variables: {
            perPage: totalCountQuery.emailTemplatesTotalCount
          }
        })
      })
    )(AutoAndManualFormContainer)
  )
);

export default withProps<Props>(
  compose(
    graphql(gql(queries.totalCount), {
      name: 'totalCountQuery'
    }),
    graphql(gql(integrationQueries.fetchApi), {
      name: 'integrationConfigsQuery',
      options: () => ({
        variables: {
          path: '/configs',
          params: {}
        }
      })
    }),
    graphql(gql(integrationQueries.fetchApi), {
      name: 'externalIntegrationsQuery',
      options: () => ({
        variables: { path: '/integrations', params: { kind: 'telnyx' } },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, IntegrationsQueryResponse>(
      gql(integrationQueries.integrations),
      {
        name: 'integrationsQuery',
        options: () => {
          return {
            variables: { kind: 'telnyx' },
            fetchPolicy: 'network-only'
          };
        }
      }
    )
  )(withTemplatesQuery)
);
