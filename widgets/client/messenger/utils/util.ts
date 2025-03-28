import {
  IBrand,
  IIntegrationMessengerData,
  IIntegrationUiOptions,
} from '../../types';

import { connection } from '../connection';
import { postMessage } from '../../utils';

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

export const getIntegrationId = () => {
  return connection.data.integrationId
}

export const getCallData = (): IIntegrationMessengerData => {
  return connection.data.callData || {};
};

export const getTicketData = (): any => {
  return connection.data.ticketData || {};
};

export const isOnline = () => {
  return getMessengerData().isOnline;
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Function to convert RGB to Hex
function rgbToHex(r: any, g: any, b: any) {
  const toHex = (x: any) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Function to adjust brightness (positive for brighter, negative for dimmer)
export function adjustBrightness(hex: string, factor: any) {
  let { r, g, b } = hexToRgb(hex);

  // Adjust each RGB value based on the factor
  r = Math.min(255, Math.max(0, r + factor));
  g = Math.min(255, Math.max(0, g + factor));
  b = Math.min(255, Math.max(0, b + factor));

  return rgbToHex(r, g, b);
}

