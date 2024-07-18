import { connection } from '../connection';
import { postMessage } from '../../utils';
import {
  IBrand,
  IIntegrationMessengerData,
  IIntegrationUiOptions,
} from '../../types';

export const toggleNotifier = (isVisible?: boolean) => {
  // notify state
  postMessage('fromMessenger', 'notifier', { isVisible: !isVisible });
};

export const toggleNotifierFull = (isVisible?: boolean) => {
  // notify state
  postMessage('fromMessenger', 'notifierFull', { isVisible: !isVisible });
};

export const getBrand = (): IBrand => {
  return connection.data.brand || {};
};

export const getUiOptions = (): IIntegrationUiOptions => {
  return connection.data.uiOptions || {};
};

export const getColor = () => {
  return getUiOptions().color;
};

export const getMessengerData = (): IIntegrationMessengerData => {
  return connection.data.messengerData || {};
};

export const isOnline = () => {
  return getMessengerData().isOnline;
};
