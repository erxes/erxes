import * as React from "react";
import {
  increaseViewCount,
  saveLead,
  sendEmail
} from "../../../form/containers/utils";
import {
  ICurrentStatus,
  IForm,
  IFormDoc,
  ISaveFormResponse
} from "../../../form/types";
import { IEmailParams, IIntegration } from "../../../types";
import { connection } from "../../connection";

interface IState {
  currentStatus: ICurrentStatus;
  isCallOutVisible: boolean;
  isSubmitting?: boolean;
}

interface IStore extends IState {
  save: (doc: IFormDoc, formCode: string) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  getIntegration: (formCode: string) => IIntegration;
  getForm: (formCode: string) => IForm;
  showForm: () => void;
}

const LeadContext = React.createContext({} as IStore);

export const LeadConsumer = LeadContext.Consumer;

export class LeadProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      currentStatus: { status: "INITIAL" },
      isCallOutVisible: true
    };
  }

  /*
   * Increasing view count
   */
  increaseViewCount = (formCode: string) => {
    const form = this.getForm(formCode);
    increaseViewCount(form._id);
  };

  /*
   * Save user submissions
   */
  save = (doc: IFormDoc, formCode: string) => {
    this.setState({ isSubmitting: true });

    saveLead({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: this.getIntegration(formCode)._id,
      formId: this.getForm(formCode)._id,
      saveCallback: (response: ISaveFormResponse) => {
        const { status, errors } = response;

        this.setState({
          isSubmitting: false,
          currentStatus: {
            status: status === "ok" ? "SUCCESS" : "ERROR",
            errors
          }
        });
      }
    });
  };

  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: "INITIAL" } });
  };

  getIntegration = (formCode: string) => {
    return connection.leadData[formCode].integration;
  };

  getForm = (formCode: string) => {
    return connection.leadData[formCode].form;
  };

  showForm = () => {
    this.setState({ isCallOutVisible: false });
  };

  render() {
    return (
      <LeadContext.Provider
        value={{
          ...this.state,
          save: this.save,
          createNew: this.createNew,
          sendEmail,
          getIntegration: this.getIntegration,
          getForm: this.getForm,
          showForm: this.showForm
        }}
      >
        {this.props.children}
      </LeadContext.Provider>
    );
  }
}
