import * as React from "react";

import { ICurrentStatus, IForm, IFormDoc } from "../../../form/types";
import { IEmailParams, IIntegration } from "../../../types";
import { LeadConsumer, LeadProvider } from "./LeadContext";

import asyncComponent from "../../../AsyncComponent";
import { formDetailQuery } from "../../../form/graphql";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const Callout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MessengerLeadCallout" */ "../../../form/components/Callout"
    )
);

const DumbForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MessengerLeadForm" */ "../../../form/components/Form"
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
    fetchPolicy: "network-only",
    variables: {
      _id: props?.form?._id,
    },
    skip: props?.form?._id ? false : true,
  });

  if (!data || loading) {
    return null;
  }

  if (!data.formDetail || !(data.formDetail.title || "").trim()) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail,
  };

  return (
    <LeadProvider>
      <LeadConsumer>
        {({
          currentStatus,
          save,
          createNew,
          sendEmail,
          isCallOutVisible,
          isSubmitting,
          showForm,
        }) => {
          const callout =
            extendedProps.form.leadData && extendedProps.form.leadData.callout;

          if (isCallOutVisible && callout && !callout.skip) {
            return (
              <Callout onSubmit={showForm} configs={callout || {}} color={""} />
            );
          }
          return (
            <DumbForm
              {...extendedProps}
              hasTopBar={false}
              isSubmitting={isSubmitting}
              currentStatus={currentStatus}
              onSubmit={save}
              onCreateNew={createNew}
              sendEmail={sendEmail}
              form={extendedProps.form}
            />
          );
        }}
      </LeadConsumer>
    </LeadProvider>
  );
};

export default LeadContent;
