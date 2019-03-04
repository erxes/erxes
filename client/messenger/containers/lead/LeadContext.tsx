import * as React from "react";
import {
  increaseViewCount,
  saveForm,
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
}

interface IStore extends IState {
  save: (doc: IFormDoc) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
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

  // componentDidMount() {
  //   this.increaseViewCount();
  // }

  /*
   * Increasing view count
   */
  increaseViewCount = () => {
    const form = this.getForm();
    increaseViewCount(form._id);
  };

  /*
   * Save user submissions
   */
  save = (doc: IFormDoc) => {
    saveForm({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: this.getIntegration()._id,
      formId: this.getForm()._id,
      saveCallback: (response: ISaveFormResponse) => {
        const { status, errors } = response;

        this.setState({
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

  getIntegration = () => {
    return connection.formData.integration;
  };

  getForm = () => {
    return connection.formData.form;
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
