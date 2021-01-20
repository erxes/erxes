import * as React from 'react';
import { IEmailParams, IIntegration, IIntegrationLeadData } from '../../types';
import { checkRules } from '../../utils';
import { connection } from '../connection';
import { ICurrentStatus, IForm, IFormDoc, ISaveFormResponse } from '../types';
import { increaseViewCount, postMessage, saveLead, sendEmail } from './utils';

interface IState {
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  currentStatus: ICurrentStatus;
  isSubmitting?: boolean;
  extraContent?: string;
  callSubmit: boolean;
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
      currentStatus: { status: 'INITIAL' },
      extraContent: '',
      callSubmit: false
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
    if (loadType === 'popup' && hasPopupHandlers) {
      return null;
    }

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    // If load type is shoutbox then hide form component initially
    if (callout.skip && loadType !== 'shoutbox') {
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
      isFormVisible: false
    });

    // Increasing view count
    increaseViewCount(this.getForm()._id);

    // for hiding blank loader screen
    const parentWindow = window.parent.document;

    const container = parentWindow.getElementsByClassName(
      'erxes-embedded-iframe'
    )[0];

    if (container && container.parentElement) {
      container.parentElement.style.display = 'none';
    }
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
      saveCallback: (response: ISaveFormResponse) => {
        const { errors } = response;

        const status = response.status === 'ok' ? 'SUCCESS' : 'ERROR';

        postMessage({
          message: 'submitResponse',
          status
        });

        this.setState({
          callSubmit: false,
          isSubmitting: false,
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
    this.setState({ currentStatus: { status: 'INITIAL' } });
  };

  setHeight = () => {
    const container = document.getElementById('erxes-container');

    if (!container) {
      return;
    }

    const elementsHeight = container.clientHeight;

    postMessage({
      message: 'changeContainerStyle',
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
          getIntegrationConfigs: this.getIntegrationConfigs
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
