import gql from "graphql-tag";
import * as React from "react";
import client from "../../apollo-client";
import { IEmailParams, IIntegration, IIntegrationFormData } from "../../types";
import { connection } from "../connection";
import {
  increaseViewCountMutation,
  saveFormMutation,
  sendEmailMutation
} from "../graphql";
import { ICurrentStatus, IForm } from "../types";
import { postMessage } from "./utils";

interface IState {
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  currentStatus: ICurrentStatus;
}

interface IStore extends IState {
  init: () => void;
  showForm: () => void;
  toggleShoutbox: (isVisible?: boolean) => void;
  showPopup: () => void;
  closePopup: () => void;
  saveForm: (doc: { [key: string]: any }) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight: () => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
  getIntegrationConfigs: () => IIntegrationFormData;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      isPopupVisible: false,
      isFormVisible: false,
      isCalloutVisible: false,
      currentStatus: { status: "INITIAL" }
    };
  }

  /*
   * Decide which component will render initially
   */
  init = () => {
    const { data, hasPopupHandlers } = connection;
    const { integration, form } = data;

    const { callout } = form;
    const { loadType } = integration.formData;

    // if there is popup handler then do not show it initially
    if (loadType === "popup" && hasPopupHandlers) {
      return null;
    }

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    // If load type is shoutbox then hide form component initially
    if (callout.skip && loadType !== "shoutbox") {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  };

  /*
   * Will be called when user click callout's submit button
   */
  showForm = () => {
    this.setState({
      isCalloutVisible: false,
      isFormVisible: true
    });
  };

  /*
   * Increasing view count
   */
  increaseViewCount = () => {
    const form = this.getForm();

    return client.mutate({
      mutation: gql(increaseViewCountMutation),
      variables: {
        formId: form._id
      }
    });
  };

  /*
   * Toggle circle button. Hide callout and show or hide form
   */
  toggleShoutbox = (isVisible?: boolean) => {
    if (!isVisible) {
      // Increasing view count
      this.increaseViewCount();
    }

    this.setState({
      isCalloutVisible: false,
      isFormVisible: !isVisible
    });
  };

  /*
   * When load type is popup, Show popup and show one of callout and form
   */
  showPopup = () => {
    const { data } = connection;
    const { integration } = data;
    const { callout } = integration.formData;

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    if (callout.skip) {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  };

  /*
   * When load type is popup, Hide popup
   */
  closePopup = () => {
    this.setState({
      isPopupVisible: false,
      isCalloutVisible: false,
      isFormVisible: false
    });

    // Increasing view count
    this.increaseViewCount();
  };

  /*
   * Save user submissions
   */
  saveForm = (doc: { [key: string]: any }) => {
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
        mutation: gql(saveFormMutation),
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
      mutation: gql(sendEmailMutation),
      variables: {
        toEmails,
        fromEmail,
        title,
        content
      }
    });
  };

  setHeight = () => {
    const container = document.getElementById("erxes-container");

    if (!container) {
      return;
    }

    const elementsHeight = container.clientHeight;

    postMessage({
      message: "changeContainerStyle",
      style: `height: ${elementsHeight}px;`
    });
  };

  getIntegration = () => {
    return connection.data.integration;
  };

  getForm = () => {
    return connection.data.form;
  };

  getIntegrationConfigs = () => {
    return this.getIntegration().formData;
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          init: this.init,
          showForm: this.showForm,
          toggleShoutbox: this.toggleShoutbox,
          showPopup: this.showPopup,
          closePopup: this.closePopup,
          saveForm: this.saveForm,
          createNew: this.createNew,
          sendEmail: this.sendEmail,
          setHeight: this.setHeight,
          getIntegration: this.getIntegration,
          getForm: this.getForm,
          getIntegrationConfigs: this.getIntegrationConfigs
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
