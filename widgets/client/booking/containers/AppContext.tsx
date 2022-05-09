import * as React from "react";
import { cancelOrder, sendEmail } from "../../form/containers/utils";
import { ICurrentStatus, ISaveFormResponse } from "../../form/types";
import { IEmailParams, IIntegration, IProduct } from "../../types";
import { connection } from "../connection";
import { IBookingData } from "../types";
import { saveBooking } from "./utils";
import QRCode = require("qrcode");

interface IState {
  activeRoute: string;
  activeBooking: IBookingData | null;
  activeCategory: string | null;
  activeProduct: string | null;
  isFormVisible: boolean;
  isPopupVisible: boolean;
  isSubmitting?: boolean;

  selectedItem: string;

  currentStatus: ICurrentStatus;
  invoiceResponse?: string;
  invoiceType?: string;
  lastMessageId?: string;
}

interface IStore extends IState {
  goToIntro: () => void;
  goToBooking: (booking: IBookingData) => void;
  goToBookings: () => void;
  goToCategory: (categoryId: string) => void;
  goToProduct: (productId: string) => void;
  getBooking: () => IBookingData;
  showForm: () => void;
  showPopup: () => void;
  closePopup: () => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  save: (params: any) => void;
  getIntegration: () => IIntegration;
  cancelOrder: (customerId: string, messageId: string) => void;
  onChangeCurrentStatus: (status: string) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: "INTRO",
      activeBooking: null,
      activeCategory: null,
      activeProduct: null,
      isFormVisible: false,
      isPopupVisible: false,
      currentStatus: { status: "INITIAL" },
      isSubmitting: false,
      selectedItem: ""
    };
  }

  goToIntro = () => {
    this.setState({
      activeRoute: "INTRO",
      activeBooking: null
    });
  };

  goToBooking = (booking: any) => {
    this.setState({
      activeRoute: "BOOKING",
      activeBooking: booking,
      selectedItem: ""
    });
  };

  goToBookings = () => {
    this.setState({
      activeRoute: "BOOKING",
      activeCategory: null,
      selectedItem: ""
    });
  };

  goToCategory = (categoryId: any) => {
    this.setState({
      activeRoute: "CATEGORY_DETAIL",
      activeCategory: categoryId,
      selectedItem: categoryId
    });
  };

  goToProduct = (productId: string) => {
    this.setState({
      activeRoute: "PRODUCT_DETAIL",
      activeProduct: productId,
      selectedItem: productId
    });
  };

  getBooking = () => {
    return connection.data.booking;
  };

  getIntegration = () => {
    return connection.data.integration;
  };

  showForm = () => {
    this.setState({
      isFormVisible: true
    });
  };

  /*
   * When load type is popup, Show popup and show one of callout and form
   */
  showPopup = () => {
    this.setState({ isPopupVisible: true });

    return this.setState({ isFormVisible: true });
  };

  /*
   * When load type is popup, Hide popup
   */
  closePopup = () => {
    const { currentStatus } = this.state;

    this.setState({
      isPopupVisible: false,
      isFormVisible: false
    });

    if (currentStatus.status === "SUCCESS") {
      this.setState({ activeRoute: "INTRO", selectedItem: "" });
    }
  };

  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: "INITIAL" } });
  };

  /**
   * User submission
   */

  save = (doc: any) => {
    if (!this.state.activeProduct) {
      return null;
    }

    this.setState({ isSubmitting: true });

    saveBooking({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: this.getIntegration()._id,
      formId: this.getIntegration().formId,
      productId: this.state.activeProduct,
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

        if (invoiceType === "socialPay") {
          if (
            invoiceResponse &&
            invoiceResponse.includes("socialpay-payment")
          ) {
            invoiceResponse = await QRCode.toDataURL(invoiceResponse);
          }
        }

        this.setState({
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
          goToBooking: this.goToBooking,
          goToIntro: this.goToIntro,
          goToCategory: this.goToCategory,
          goToBookings: this.goToBookings,
          goToProduct: this.goToProduct,
          getBooking: this.getBooking,
          showForm: this.showForm,
          showPopup: this.showPopup,
          closePopup: this.closePopup,
          createNew: this.createNew,
          sendEmail,
          save: this.save,
          getIntegration: this.getIntegration,
          cancelOrder: this.cancelOrder,
          onChangeCurrentStatus: this.onChangeCurrentStatus
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
