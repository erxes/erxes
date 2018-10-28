import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IEmailParams, IIntegration } from "../../../types";
import { Form as DumbForm } from "../../components";
import queries from "../../graphql";
import { ICurrentStatus, IForm } from "../../types";
import { LeadConsumer, LeadProvider } from "./LeadContext";

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

  return <DumbForm {...extendedProps} />;
};

type QueryResponse = {
  form: IForm;
};

interface IProps {
  integration: IIntegration;
  form: IForm;
  currentStatus: ICurrentStatus;
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
  onCreateNew: () => void;
  sendEmail: (params: IEmailParams) => void;
}

const FormWithData = graphql<IProps, QueryResponse>(gql(queries.formQuery), {
  options: ({ form }) => ({
    fetchPolicy: "network-only",
    variables: {
      formId: form._id
    }
  })
})(Form);

const WithContext = () => (
  <LeadProvider>
    <LeadConsumer>
      {({
        currentStatus,
        saveForm,
        createNew,
        sendEmail,
        getIntegration,
        getForm
      }) => {
        const integration = getIntegration();
        const form = getForm();

        return (
          <FormWithData
            currentStatus={currentStatus}
            onSubmit={saveForm}
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
