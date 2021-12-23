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
  const configs: any = [];

  const mappedIntegrations: IIntegrationWithPhone[] = [];

  const updatedProps = {
    ...props,
    templates: [],
    smsConfig: configs.find(i => i.code === 'TELNYX_API_KEY'),
    integrations: mappedIntegrations
  };

  const content = formProps => (
    <AutoAndManualForm {...updatedProps} {...formProps} />
  );

  return <FormBase kind={props.kind || ''} content={content} />;
};

export default  withProps<Props>( compose()(AutoAndManualFormContainer))