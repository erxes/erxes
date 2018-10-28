import gql from "graphql-tag";
import * as React from "react";
import client from "../../../apollo-client";
import {
  IEmailParams,
  IIntegration,
  IIntegrationFormData
} from "../../../types";
import queries from "../../graphql";
import { ICurrentStatus, IForm } from "../../types";
import { connection } from "../../connection";

interface IState {
  isFormVisible: boolean;
  currentStatus: ICurrentStatus;
}

interface IStore extends IState {
  showForm: () => void;
  saveForm: (doc: any) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
  getIntegrationConfigs: () => IIntegrationFormData;
}

const LeadContext = React.createContext({} as IStore);

export const LeadConsumer = LeadContext.Consumer;

export class LeadProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      isFormVisible: false,
      currentStatus: { status: "INITIAL" }
    };
  }

  /*
   * Will be called when user click callout's submit button
   */
  showForm = () => {
    this.setState({ isFormVisible: true });
  };

  /*
   * Increasing view count
   */
  increaseViewCount = () => {
    const form = this.getForm();

    return client.mutate({
      mutation: gql(queries.increaseViewCountMutation),
      variables: {
        formId: form._id
      }
    });
  };

  /*
   * Save user submissions
   */
  saveForm = (doc: any) => {
    const submissions = Object.keys(doc).map(fieldId => {
      const { value, text, type, validation } = doc[fieldId];

      return {
        _id: fieldId,
        type,
        text,
        value,
        validation
      };
    });

    const integration = this.getIntegration();
    const form = this.getForm();

    client
      .mutate({
        mutation: gql(queries.saveFormMutation),
        variables: {
          integrationId: integration._id,
          formId: form._id,
          browserInfo: connection.browserInfo,
          submissions
        }
      })

      .then(({ data: { saveForm } }: any) => {
        const { status, errors } = saveForm;

        this.setState({
          currentStatus: {
            status: status === "ok" ? "SUCCESS" : "ERROR",
            errors
          }
        });
      });
  };

  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: "INITIAL" } });
  };

  /*
   * Send email to submitted user after successfull submission
   */
  sendEmail = ({ toEmails, fromEmail, title, content }: IEmailParams) => {
    client.mutate({
      mutation: gql(queries.sendEmailMutation),
      variables: {
        toEmails,
        fromEmail,
        title,
        content
      }
    });
  };

  getIntegration = () => {
    return connection.formData.integration;
  };

  getForm = () => {
    return connection.formData.form;
  };

  getIntegrationConfigs = () => {
    return this.getIntegration().formData;
  };

  render() {
    return (
      <LeadContext.Provider
        value={{
          ...this.state,
          showForm: this.showForm,
          saveForm: this.saveForm,
          createNew: this.createNew,
          sendEmail: this.sendEmail,
          getIntegration: this.getIntegration,
          getForm: this.getForm,
          getIntegrationConfigs: this.getIntegrationConfigs
        }}
      >
        {this.props.children}
      </LeadContext.Provider>
    );
  }
}
