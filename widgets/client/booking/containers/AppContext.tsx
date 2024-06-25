import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { sendEmail } from '../../form/containers/utils';
import { ICurrentStatus, ISaveFormResponse } from '../../form/types';
import { IEmailParams, IIntegration } from '../../types';
import { connection } from '../connection';
import { IBookingData } from '../types';
import { saveBooking } from './utils';

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
}

type Action =
  | { type: 'SET_ACTIVE_ROUTE'; payload: string }
  | { type: 'SET_ACTIVE_BOOKING'; payload: IBookingData | null }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: string | null }
  | { type: 'SET_ACTIVE_PRODUCT'; payload: string | null }
  | { type: 'SET_FORM_VISIBLE'; payload: boolean }
  | { type: 'SET_POPUP_VISIBLE'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SELECTED_ITEM'; payload: string }
  | { type: 'SET_CURRENT_STATUS'; payload: ICurrentStatus };

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
  onChangeCurrentStatus: (status: string) => void;
}

const initialState: IState = {
  activeRoute: 'INTRO',
  activeBooking: null,
  activeCategory: null,
  activeProduct: null,
  isFormVisible: false,
  isPopupVisible: false,
  currentStatus: { status: 'INITIAL' },
  isSubmitting: false,
  selectedItem: '',
};

const AppContext = createContext({} as IStore);

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case 'SET_ACTIVE_ROUTE':
      return { ...state, activeRoute: action.payload };
    case 'SET_ACTIVE_BOOKING':
      return { ...state, activeBooking: action.payload };
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_ACTIVE_PRODUCT':
      return { ...state, activeProduct: action.payload };
    case 'SET_FORM_VISIBLE':
      return { ...state, isFormVisible: action.payload };
    case 'SET_POPUP_VISIBLE':
      return { ...state, isPopupVisible: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_CURRENT_STATUS':
      return { ...state, currentStatus: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goToIntro = () => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'INTRO' });
    dispatch({ type: 'SET_ACTIVE_BOOKING', payload: null });
  };

  const goToBooking = (booking: IBookingData) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'BOOKING' });
    dispatch({ type: 'SET_ACTIVE_BOOKING', payload: booking });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: '' });
  };

  const goToBookings = () => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'BOOKING' });
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: null });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: '' });
  };

  const goToCategory = (categoryId: string) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'CATEGORY_DETAIL' });
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: categoryId });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: categoryId });
  };

  const goToProduct = (productId: string) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'PRODUCT_DETAIL' });
    dispatch({ type: 'SET_ACTIVE_PRODUCT', payload: productId });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: productId });
  };

  const getBooking = () => {
    return connection.data.booking;
  };

  const getIntegration = () => {
    return connection.data.integration;
  };

  const showForm = () => {
    dispatch({ type: 'SET_FORM_VISIBLE', payload: true });
  };

  const showPopup = () => {
    dispatch({ type: 'SET_POPUP_VISIBLE', payload: true });
    dispatch({ type: 'SET_FORM_VISIBLE', payload: true });
  };

  const closePopup = () => {
    const { currentStatus } = state;

    dispatch({ type: 'SET_POPUP_VISIBLE', payload: false });
    dispatch({ type: 'SET_FORM_VISIBLE', payload: false });

    if (currentStatus.status === 'SUCCESS') {
      dispatch({ type: 'SET_ACTIVE_ROUTE', payload: 'INTRO' });
      dispatch({ type: 'SET_SELECTED_ITEM', payload: '' });
    }
  };

  const createNew = () => {
    dispatch({ type: 'SET_CURRENT_STATUS', payload: { status: 'INITIAL' } });
  };

  const save = (doc: any) => {
    if (!state.activeProduct) {
      return null;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    saveBooking({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: getIntegration()._id,
      formId: getIntegration().formId,
      productId: state.activeProduct,
      saveCallback: async (response: ISaveFormResponse) => {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
      },
    });
  };

  const sendEmailHandler = (params: IEmailParams) => {
    sendEmail(params);
  };

  const onChangeCurrentStatus = (status: string) => {
    dispatch({ type: 'SET_CURRENT_STATUS', payload: { status } });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        goToIntro,
        goToBooking,
        goToBookings,
        goToCategory,
        goToProduct,
        getBooking,
        showForm,
        showPopup,
        closePopup,
        createNew,
        sendEmail: sendEmailHandler,
        save,
        getIntegration,
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
