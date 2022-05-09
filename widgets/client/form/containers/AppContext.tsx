import * as React from "react";
import { IEmailParams, IIntegration, IIntegrationLeadData } from "../../types";
import { checkRules } from "../../utils";
import { connection } from "../connection";
import { ICurrentStatus, IForm, IFormDoc, ISaveFormResponse } from "../types";
import {
  cancelOrder,
  increaseViewCount,
  postMessage,
  saveLead,
  sendEmail
} from "./utils";
import QRCode = require("qrcode");
interface IState {
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  currentStatus: ICurrentStatus;
  isSubmitting?: boolean;
  extraContent?: string;
  callSubmit: boolean;
  invoiceResponse?: string;
  invoiceType?: string;
  lastMessageId?: string;
}

interface IStore extends IState {
  init: () => void;
  showForm: () => void;
  toggleShoutbox: (isVisible?: boolean) => void;
  showPopup: () => void;
  closePopup: () => void;
  save: (doc: IFormDoc) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight: () => void;
  setCallSubmit: (state: boolean) => void;
  setExtraContent: (content: string) => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
  getIntegrationConfigs: () => IIntegrationLeadData;
  cancelOrder: (customerId: string, messageId: string) => void;
  onChangeCurrentStatus: (status: string) => void;
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
      currentStatus: { status: "INITIAL" },
      extraContent: "",
      callSubmit: false,
      invoiceResponse: "",
      invoiceType: ""
    };
  }

  /*
   * Decide which component will render initially
   */
  init = async () => {
    const { data, browserInfo, hasPopupHandlers } = connection;
    const { integration } = data;

    if (!browserInfo) {
      return;
    }

    const { loadType, callout, rules } = integration.leadData;

    // check rules ======
    const isPassedAllRules = await checkRules(rules, browserInfo);

    if (!isPassedAllRules) {
      return this.setState({
        isPopupVisible: false,
        isFormVisible: false,
        isCalloutVisible: false
      });
    }

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
   * Toggle circle button. Hide callout and show or hide form
   */
  toggleShoutbox = (isVisible?: boolean) => {
    if (!isVisible) {
      // Increasing view count
      increaseViewCount(this.getForm()._id);
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
    const { callout } = integration.leadData;

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
      isFormVisible: false,
      currentStatus: { status: "INITIAL" }
    });

    // Increasing view count
    increaseViewCount(this.getForm()._id);
  };

  /*
   * Save user submissions
   */
  save = (doc: IFormDoc) => {
    this.setState({ isSubmitting: true });

    saveLead({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: this.getIntegration()._id,
      formId: this.getForm()._id,
      saveCallback: async (response: ISaveFormResponse) => {
        const { errors } = response;
        let { invoiceResponse, invoiceType } = response;

        let status = "ERROR";

        switch (response.status) {
          case "ok":
            status = "SUCESS";
            break;
          case "pending":
            status = "PENDING";
            break;
          default:
            status = "ERROR";
            break;
        }

        postMessage({
          message: "submitResponse",
          status
        });

        if (invoiceType === "socialPay") {
          if (
            invoiceResponse &&
            invoiceResponse.includes("socialpay-payment")
          ) {
            invoiceResponse = await QRCode.toDataURL(invoiceResponse);
          }
        }

        this.setState({
          callSubmit: false,
          isSubmitting: false,
          invoiceResponse,
          invoiceType,
          lastMessageId: response.messageId,
          currentStatus: {
            status,
            errors
          }
        });
      }
    });
  };

  setExtraContent = (content: string) => {
    this.setState({ extraContent: content });
  };

  setCallSubmit = (state: boolean) => {
    this.setState({ callSubmit: state });
  };

  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: "INITIAL" } });
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
    return this.getIntegration().leadData;
  };

  cancelOrder = (customerId: string, messageId: string) => {
    cancelOrder({
      customerId,
      messageId,
      cancelCallback: (response: string) => {
        this.setState({ currentStatus: { status: response } });
      }
    });
  };

  onChangeCurrentStatus = (status: string) => {
    this.setState({ currentStatus: { status } });
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
          save: this.save,
          createNew: this.createNew,
          sendEmail,
          setHeight: this.setHeight,
          setCallSubmit: this.setCallSubmit,
          setExtraContent: this.setExtraContent,
          getIntegration: this.getIntegration,
          getForm: this.getForm,
          getIntegrationConfigs: this.getIntegrationConfigs,
          cancelOrder: this.cancelOrder,
          onChangeCurrentStatus: this.onChangeCurrentStatus
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
