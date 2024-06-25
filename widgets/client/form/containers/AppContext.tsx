import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { checkRules, getEnv } from '../../utils';
import { connection } from '../connection';
import { ICurrentStatus, IForm, IFormDoc, ISaveFormResponse } from '../types';
import {
  generatePaymentLink,
  increaseViewCount,
  postMessage,
  saveLead,
  sendEmail,
} from './utils';
import * as cookie from 'cookie';
import { IEmailParams, IIntegration, IIntegrationLeadData } from '../../types';

interface IState {
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  currentStatus: ICurrentStatus;
  isSubmitting?: boolean;
  extraContent?: string;
  callSubmit: boolean;
  invoiceLink?: string;
}

type Action =
  | { type: 'SET_POPUP_VISIBLE'; payload: boolean }
  | { type: 'SET_FORM_VISIBLE'; payload: boolean }
  | { type: 'SET_CALLOUT_VISIBLE'; payload: boolean }
  | { type: 'SET_CURRENT_STATUS'; payload: ICurrentStatus }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_EXTRA_CONTENT'; payload: string }
  | { type: 'SET_CALL_SUBMIT'; payload: boolean }
  | { type: 'SET_INVOICE_LINK'; payload: string };

interface IStore extends IState {
  init: () => void;
  showForm: () => void;
  toggleShoutbox: (isVisible?: boolean) => void;
  showPopup: () => void;
  closePopup: () => void;
  save: (
    doc: IFormDoc,
    formCode?: string,
    requiredPaymentAmount?: number
  ) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight: () => void;
  setCallSubmit: (state: boolean) => void;
  setExtraContent: (content: string) => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
  getIntegrationConfigs: () => IIntegrationLeadData;
  onChangeCurrentStatus: (status: string) => void;
}

const initialState: IState = {
  isPopupVisible: false,
  isFormVisible: false,
  isCalloutVisible: false,
  currentStatus: { status: 'INITIAL' },
  callSubmit: false,
};

const AppContext = createContext({} as IStore);

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case 'SET_POPUP_VISIBLE':
      return { ...state, isPopupVisible: action.payload };
    case 'SET_FORM_VISIBLE':
      return { ...state, isFormVisible: action.payload };
    case 'SET_CALLOUT_VISIBLE':
      return { ...state, isCalloutVisible: action.payload };
    case 'SET_CURRENT_STATUS':
      return { ...state, currentStatus: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_EXTRA_CONTENT':
      return { ...state, extraContent: action.payload };
    case 'SET_CALL_SUBMIT':
      return { ...state, callSubmit: action.payload };
    case 'SET_INVOICE_LINK':
      return { ...state, invoiceLink: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = async () => {
    const { data, browserInfo, hasPopupHandlers } = connection;
    const { integration } = data;

    if (!browserInfo) {
      return;
    }

    const { loadType, callout, rules } = integration.leadData;

    // check rules ======
    const isPassedAllRules = await checkRules(rules, browserInfo);

    if (!isPassedAllRules) {
      return dispatch({
        type: 'SET_POPUP_VISIBLE',
        payload: false,
      });
    }

    // if there is popup handler then do not show it initially
    if (loadType === 'popup' && hasPopupHandlers) {
      return null;
    }

    dispatch({
      type: 'SET_POPUP_VISIBLE',
      payload: true,
    });

    // if there is no callout setting then show form
    if (!callout) {
      return dispatch({
        type: 'SET_FORM_VISIBLE',
        payload: true,
      });
    }

    // If load type is shoutbox then hide form component initially
    if (callout.skip && loadType !== 'shoutbox') {
      return dispatch({
        type: 'SET_FORM_VISIBLE',
        payload: true,
      });
    }

    dispatch({
      type: 'SET_CALLOUT_VISIBLE',
      payload: true,
    });
  };

  const showForm = () => {
    const cookies = cookie.parse(document.cookie);

    const paymentCookies = Object.keys(cookies).filter((key) =>
      key.includes('paymentData')
    );

    if (paymentCookies.length > 0) {
      if (cookies[paymentCookies[0]]) {
        const { API_URL } = getEnv();

        dispatch({
          type: 'SET_CURRENT_STATUS',
          payload: { status: 'PAYMENT_PENDING' },
        });

        dispatch({
          type: 'SET_INVOICE_LINK',
          payload: `${API_URL}/pl:payment/gateway?params=${cookies[paymentCookies[0]]}`,
        });
      }
    }

    dispatch({
      type: 'SET_CALLOUT_VISIBLE',
      payload: false,
    });

    dispatch({
      type: 'SET_FORM_VISIBLE',
      payload: true,
    });
  };

  const toggleShoutbox = (isVisible?: boolean) => {
    if (!isVisible) {
      increaseViewCount(getForm()._id);
    }

    dispatch({
      type: 'SET_CALLOUT_VISIBLE',
      payload: false,
    });

    dispatch({
      type: 'SET_FORM_VISIBLE',
      payload: !isVisible,
    });
  };

  const showPopup = () => {
    const { data } = connection;
    const { integration } = data;
    const { callout } = integration.leadData;

    dispatch({
      type: 'SET_POPUP_VISIBLE',
      payload: true,
    });

    // if there is no callout setting then show form
    if (!callout) {
      return dispatch({
        type: 'SET_FORM_VISIBLE',
        payload: true,
      });
    }

    if (callout.skip) {
      return dispatch({
        type: 'SET_FORM_VISIBLE',
        payload: true,
      });
    }

    dispatch({
      type: 'SET_CALLOUT_VISIBLE',
      payload: true,
    });
  };

  const closePopup = () => {
    dispatch({
      type: 'SET_POPUP_VISIBLE',
      payload: false,
    });

    dispatch({
      type: 'SET_CALLOUT_VISIBLE',
      payload: false,
    });

    dispatch({
      type: 'SET_FORM_VISIBLE',
      payload: false,
    });

    dispatch({
      type: 'SET_CURRENT_STATUS',
      payload: { status: 'INITIAL' },
    });

    increaseViewCount(getForm()._id);
  };

  const save = (
    doc: IFormDoc,
    _formCode?: string,
    requiredPaymentAmount?: number
  ) => {
    dispatch({
      type: 'SET_SUBMITTING',
      payload: true,
    });

    saveLead({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: getIntegration()._id,
      formId: getForm()._id,
      userId: connection.setting.user_id,
      saveCallback: async (response: ISaveFormResponse) => {
        const { errors } = response;

        let status = 'ERROR';

        switch (response.status) {
          case 'ok':
            status = 'SUCCESS';
            break;
          default:
            status = 'ERROR';
            break;
        }

        if (
          status !== 'ERROR' &&
          requiredPaymentAmount &&
          requiredPaymentAmount > 0 &&
          connection.enabledServices.products &&
          connection.enabledServices.payment
        ) {
          status = 'PAYMENT_PENDING';

          try {
            const invoiceLink = await generatePaymentLink(
              requiredPaymentAmount,
              response.conversationId
            );

            if (invoiceLink) {
              dispatch({
                type: 'SET_INVOICE_LINK',
                payload: invoiceLink,
              });
            }
          } catch (e) {
            status = 'ERROR';
            dispatch({
              type: 'SET_CURRENT_STATUS',
              payload: { status },
            });
          }
        }

        postMessage({
          message: 'submitResponse',
          status,
          response,
        });

        dispatch({
          type: 'SET_CALLOUT_VISIBLE',
          payload: false,
        });

        dispatch({
          type: 'SET_SUBMITTING',
          payload: false,
        });

        dispatch({
          type: 'SET_CURRENT_STATUS',
          payload: {
            status,
            errors,
          },
        });
      },
    });
  };

  const setExtraContent = (content: string) => {
    dispatch({
      type: 'SET_EXTRA_CONTENT',
      payload: content,
    });
  };

  const setCallSubmit = (state: boolean) => {
    dispatch({
      type: 'SET_CALL_SUBMIT',
      payload: state,
    });
  };

  const createNew = () => {
    dispatch({
      type: 'SET_CURRENT_STATUS',
      payload: { status: 'INITIAL' },
    });
  };

  const setHeight = () => {
    const container = document.getElementById('erxes-container');

    if (!container) {
      return;
    }

    const elementsHeight = container.clientHeight;

    postMessage({
      message: 'changeContainerStyle',
      style: `height: ${elementsHeight}px;`,
    });
  };

  const getIntegration = () => {
    return connection.data.integration;
  };

  const getForm = () => {
    return connection.data.form;
  };

  const getIntegrationConfigs = () => {
    return getIntegration().leadData;
  };

  const onChangeCurrentStatus = (status: string) => {
    dispatch({
      type: 'SET_CURRENT_STATUS',
      payload: { status },
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        init,
        showForm,
        toggleShoutbox,
        showPopup,
        closePopup,
        save,
        createNew,
        sendEmail,
        setHeight,
        setCallSubmit,
        setExtraContent,
        getIntegration,
        getForm,
        getIntegrationConfigs,
        onChangeCurrentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
