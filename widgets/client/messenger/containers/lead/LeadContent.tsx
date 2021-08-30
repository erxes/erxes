import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { Callout, Form as DumbForm } from "../../../form/components";
import { formDetailQuery } from "../../../form/graphql";
import { ICurrentStatus, IForm, IFormDoc } from "../../../form/types";
import { IEmailParams, IIntegration } from "../../../types";
import { LeadConsumer, LeadProvider } from "./LeadContext";

const LeadContent = (props: ChildProps<IProps, QueryResponse>) => {
  const data = props.data;

  if (!data || data.loading) {
    return null;
  }

  if (!data.formDetail || !(data.formDetail.title || "").trim()) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail
  };

  return <DumbForm {...extendedProps} hasTopBar={false} />;
};

type QueryResponse = {
  formDetail: IForm;
};

interface IProps {
  isSubmitting?: boolean;
  integration: IIntegration;
  form: IForm;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: IFormDoc, formCode: string) => void;
  onCreateNew: () => void;
  sendEmail: (params: IEmailParams) => void;
}

const FormWithData = graphql<IProps, QueryResponse>(gql(formDetailQuery), {
  options: ({ form }) => ({
    fetchPolicy: "network-only",
    variables: {
      _id: form._id
    }
  })
})(LeadContent);

const WithContext = ({ formCode }: { formCode: string }) => (
  <LeadProvider>
    <LeadConsumer>
      {({
        currentStatus,
        save,
        createNew,
        sendEmail,
        getIntegration,
        getForm,
        isCallOutVisible,
        isSubmitting,
        showForm
      }) => {
        const integration = getIntegration(formCode);
        const form = getForm(formCode);

        const callout = integration.leadData && integration.leadData.callout;

        if (isCallOutVisible && callout && !callout.skip) {
          return (
            <Callout onSubmit={showForm} configs={callout || {}} color={""} />
          );
        }

        return (
          <FormWithData
            isSubmitting={isSubmitting}
            currentStatus={currentStatus}
            onSubmit={save}
            onCreateNew={createNew}
            sendEmail={sendEmail}
            form={form}
            integration={integration}
          />
        );
      }}
    </LeadConsumer>
  </LeadProvider>
);

export default WithContext;
