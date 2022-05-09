import ApolloClient, { ApolloError, SubscriptionOptions } from "apollo-client";
import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import client from "../../apollo-client";
import { IEmailParams, IIntegration } from "../../types";
import { Form as DumbForm } from "../components";
import { formDetailQuery, formInvoiceUpdated } from "../graphql";
import { ICurrentStatus, IForm, IFormDoc } from "../types";
import { AppConsumer } from "./AppContext";

const Form = (props: ChildProps<IProps, QueryResponse>) => {
  const data = props.data;

  if (!data || data.loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail
  };

  React.useEffect(() => {
    client
      .subscribe({
        query: gql(formInvoiceUpdated),
        variables: { messageId: props.lastMessageId || "" }
      })
      .subscribe({
        next({ data }) {
          if (data.formInvoiceUpdated.status === "success") {
            props.onChangeCurrentStatus("SUCCESS");
          }
        },
        error(err: any) {
          console.error("err", err);
        }
      });
  });

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

type QueryResponse = {
  formDetail: IForm;
};

interface IProps {
  integration: IIntegration;
  form: IForm;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: IFormDoc) => void;
  onCreateNew: () => void;
  setHeight: () => void;
  sendEmail: (params: IEmailParams) => void;
  callSubmit: boolean;
  extraContent?: string;
  isSubmitting?: boolean;
  invoiceResponse?: any;
  invoiceType?: string;
  lastMessageId?: string;
  onCancelOrder: (customerId: string, messageId: string) => void;
  onChangeCurrentStatus: (status: string) => void;
}

const FormWithData = graphql<IProps, QueryResponse>(
  gql(formDetailQuery),

  {
    options: ({ form }) => ({
      fetchPolicy: "network-only",
      variables: {
        _id: form._id
      }
    })
  }
)(Form);

const WithContext = () => (
  <AppConsumer>
    {({
      currentStatus,
      save,
      createNew,
      sendEmail,
      setHeight,
      getIntegration,
      callSubmit,
      extraContent,
      isSubmitting,
      getForm,
      invoiceResponse,
      invoiceType,
      lastMessageId,
      cancelOrder,
      onChangeCurrentStatus
    }) => {
      const integration = getIntegration();
      const form = getForm();

      return (
        <FormWithData
          isSubmitting={isSubmitting}
          currentStatus={currentStatus}
          onSubmit={save}
          onCreateNew={createNew}
          sendEmail={sendEmail}
          setHeight={setHeight}
          form={form}
          integration={integration}
          extraContent={extraContent}
          callSubmit={callSubmit}
          invoiceResponse={invoiceResponse}
          invoiceType={invoiceType}
          lastMessageId={lastMessageId}
          onCancelOrder={cancelOrder}
          onChangeCurrentStatus={onChangeCurrentStatus}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
