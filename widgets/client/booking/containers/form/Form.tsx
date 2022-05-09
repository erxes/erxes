import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import client from "../../../apollo-client";
import DumbForm from "../../../form/components/Form";
import { formInvoiceUpdated } from "../../../form/graphql";
import { ICurrentStatus, IForm } from "../../../form/types";
import { formDetailQuery } from "../../graphql";
import { AppConsumer } from "../AppContext";

const Form = (props: ChildProps<IProps, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail,
    integration: props.integration
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
  integration: any;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: any) => void;
  onCreateNew: () => void;
  sendEmail: (params: any) => void;
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
    options: ({ integration }) => ({
      fetchPolicy: "network-only",
      variables: {
        _id: integration.formId
      }
    })
  }
)(Form);

const WithContext = () => (
  <AppConsumer>
    {({
      currentStatus,
      createNew,
      sendEmail,
      isSubmitting,
      getIntegration,
      save,
      invoiceResponse,
      lastMessageId,
      invoiceType,
      cancelOrder,
      onChangeCurrentStatus
    }) => {
      const integration = getIntegration();

      return (
        <FormWithData
          isSubmitting={isSubmitting}
          currentStatus={currentStatus}
          onSubmit={save}
          onCreateNew={createNew}
          sendEmail={sendEmail}
          integration={integration}
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
