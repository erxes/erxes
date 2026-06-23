// src/config.ts
declare global {
  interface Window {
    WIDGET_CONFIG?: {
      API_URL: string;
    };
  }
}

const fromWidget = window.WIDGET_CONFIG?.API_URL;

export const API_URL =
  fromWidget && fromWidget !== 'undefined'
    ? fromWidget
    : `${window.location.origin}/pl:payment`;
