import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IEmailParams, IIntegration } from "../../types";
import { Form as DumbForm } from "../components";
import { formQuery } from "../graphql";
import { ICurrentStatus, IForm, IFormDoc } from "../types";
import { AppConsumer } from "./AppContext";

const Form = (props: ChildProps<IProps, QueryResponse>) => {
  const data = props.data;

  if (!data || data.loading) {
    return null;
  }

  if (!data.form) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.form
  };

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

type QueryResponse = {
  form: IForm;
};

interface IProps {
  integration: IIntegration;
  form: IForm;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: IFormDoc) => void;
  onCreateNew: () => void;
  setHeight: () => void;
  sendEmail: (params: IEmailParams) => void;
}

const FormWithData = graphql<IProps, QueryResponse>(
  gql(formQuery),

  {
    options: ({ form }) => ({
      fetchPolicy: "network-only",
      variables: {
        formId: form._id
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
      getForm
    }) => {
      const integration = getIntegration();
      const form = getForm();

      return (
        <FormWithData
          currentStatus={currentStatus}
          onSubmit={save}
          onCreateNew={createNew}
          sendEmail={sendEmail}
          setHeight={setHeight}
          form={form}
          integration={integration}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
