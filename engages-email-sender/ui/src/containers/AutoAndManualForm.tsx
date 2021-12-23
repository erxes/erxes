import * as compose from 'lodash.flowright';
import { withProps } from 'erxes-ui/lib/utils';
import React from 'react';
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
  brands: any[];
  scheduleDate?: IEngageScheduleDate;
  totalCountQuery?: any;
  segmentType?: string;
};

type FinalProps = {
  emailTemplatesQuery: any;
  integrationConfigsQuery: any;
  externalIntegrationsQuery: any;
  integrationsQuery: any;
  users: any[];
  isActionLoading: boolean;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  smsConfig: any;
} & Props;

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

export default  withProps<Props>( compose()(AutoAndManualFormContainer))