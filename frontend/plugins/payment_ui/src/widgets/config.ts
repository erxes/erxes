// src/config.ts
declare global {
  interface Window {
    WIDGET_CONFIG?: {
      API_URL: string;
    };
  }
}

export const API_URL = window.WIDGET_CONFIG?.API_URL || 'http://localhost:4000';
