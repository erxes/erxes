import * as React from 'react';
import { saveLead, sendEmail } from '../../form/containers/utils';
import { ISaveFormResponse } from '../../form/types';
import { IEmailParams } from '../../types';
import { connection } from '../connection';
import { IBooking, ICurrentStatus } from '../types';

interface IState {
  activeRoute: string;
  activeBooking: IBooking | null;
  activeBlock: string | null;
  activeFloor: string | null;
  activeProduct: string | null;
  isFormVisible: boolean;
  isPopupVisible: boolean;
  isSubmitting?: boolean;

  currentStatus: ICurrentStatus;
}

interface IStore extends IState {
  goToIntro: () => void;
  goToBooking: (booking: IBooking) => void;
  goToBookings: () => void;
  goToBlock: (blockId: string) => void;
  goToFloor: (floorId: string) => void;
  goToProduct: (productId: string) => void;
  getBooking: () => IBooking;
  showForm: () => void;
  showPopup: () => void;
  closePopup: () => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  save: (params: any) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: 'INTRO',
      activeBooking: null,
      activeBlock: null,
      activeFloor: null,
      activeProduct: null,
      isFormVisible: false,
      isPopupVisible: false,
      currentStatus: { status: 'INITIAL' },
      isSubmitting: false
    };
  }

  goToIntro = () => {
    this.setState({
      activeRoute: 'INTRO',
      activeBooking: null
    });
  };

  goToBooking = (booking: any) => {
    this.setState({
      activeRoute: 'BOOKING',
      activeBooking: booking
    });
  };

  goToBookings = () => {
    this.setState({
      activeRoute: 'BOOKING',
      activeBlock: null
    });
  };

  goToBlock = (blockId: any) => {
    this.setState({
      activeRoute: 'BLOCK_DETAIL',
      activeBlock: blockId
    });
  };

  goToFloor = (floorId: any) => {
    this.setState({
      activeRoute: 'FLOOR_DETAIL',
      activeFloor: floorId
    });
  };

  goToProduct = (productId: string) => {
    this.setState({
      activeRoute: 'PRODUCT_DETAIL',
      activeProduct: productId
    });
  };

  getBooking = () => {
    return connection.data.booking;
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
    this.setState({
      isPopupVisible: false,
      isFormVisible: false
    });
  };

  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: 'INITIAL' } });
  };

  /**
   * User submission
   */

  save = (doc: any) => {
    this.setState({ isSubmitting: true });

    saveLead({
      doc,
      browserInfo: {
        hostname:
          'http://localhost:3200/test?type=form&brand_id=Lqn43J&form_id=RxkbAB',
        language: 'en-US',
        url: '/test',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
      },
      integrationId: this.getBooking()._id,
      formId: this.getBooking().formId,
      saveCallback: (response: ISaveFormResponse) => {
        const { errors } = response;

        const status = response.status === 'ok' ? 'SUCCESS' : 'ERROR';

        postMessage({
          message: 'submitResponse',
          status
        });

        this.setState({
          // callSubmit: false,
          isSubmitting: false,
          currentStatus: {
            status,
            errors
          }
        });
      }
    });
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          goToBooking: this.goToBooking,
          goToIntro: this.goToIntro,
          goToBlock: this.goToBlock,
          goToBookings: this.goToBookings,
          goToFloor: this.goToFloor,
          goToProduct: this.goToProduct,
          getBooking: this.getBooking,
          showForm: this.showForm,
          showPopup: this.showPopup,
          closePopup: this.closePopup,
          createNew: this.createNew,
          sendEmail,
          save: this.save
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
