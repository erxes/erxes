import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IEmailParams, IIntegration } from "../../types";
import { Form as DumbForm } from "../components";
import { formDetailQuery } from "../graphql";
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
  isSubmitting?: boolean;
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
      isSubmitting,
      getForm
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
          callSubmit={callSubmit}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
