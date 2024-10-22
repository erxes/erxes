import gql from 'graphql-tag';
import * as React from 'react';
import asyncComponent from '../../../AsyncComponent';
import { formDetailQuery } from '../../../form/graphql';
import { ICurrentStatus, IForm, IFormDoc } from '../../../form/types';
import { IEmailParams, IIntegration } from '../../../types';
import { LeadConsumer, LeadProvider } from './LeadContext';
import { useQuery } from '@apollo/client';

const Callout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MessengerLeadCallout" */ '../../../form/components/Callout'
    )
);

const DumbForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MessengerLeadForm" */ '../../../form/components/Form'
    )
);
interface IProps {
  isSubmitting?: boolean;
  integration?: IIntegration;
  form?: IForm;
  currentStatus?: ICurrentStatus;
  onSubmit?: (doc: IFormDoc, formCode: string) => void;
  onCreateNew?: () => void;
  sendEmail?: (params: IEmailParams) => void;
  formCode: string;
}

const LeadContent: React.FC<IProps> = (props) => {
  const { data, loading } = useQuery(gql(formDetailQuery(false)), {
    fetchPolicy: 'network-only',
    variables: {
      _id: props?.form?._id,
    },
    skip: Boolean(props?.form?._id),
  });

  if (!data || loading) {
    return null;
  }

  if (!data.formDetail || !(data.formDetail.title || '').trim()) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail,
  };

  return (
    <LeadProvider>
      <LeadConsumer>
        {({ isCallOutVisible, getIntegration, getForm, showForm }) => {
          const integration = getIntegration(props.formCode);
          const form = getForm(props.formCode);

          const callout = form.leadData && form.leadData.callout;

          if (isCallOutVisible && callout && !callout.skip) {
            return (
              <Callout onSubmit={showForm} configs={callout || {}} color={''} />
            );
          }
          return <DumbForm {...extendedProps} hasTopBar={false} />;
        }}
      </LeadConsumer>
    </LeadProvider>
  );
};

export default LeadContent;
