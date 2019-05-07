import T from "i18n-react";
import * as moment from "moment";
import "moment/locale/mn";
import translation from "../locales";
import { ENV, IBrowserInfo } from "./types";

export const getBrowserInfo = async () => {
  if (window.location.hostname === "localhost") {
    return {};
  }

  let location;

  try {
    const response = await fetch("https://geo.erxes.io");

    location = await response.json();
  } catch (e) {
    console.log(e.message);

    location = {
      city: "",
      remoteAddress: "",
      region: "",
      country: "",
      countryCode: ""
    };
  }

  return {
    remoteAddress: location.network,
    region: location.region,
    countryCode: location.countryCode,
    city: location.city,
    country: location.countryName,
    url: window.location.pathname,
    hostname: window.location.origin,
    language: navigator.language,
    userAgent: navigator.userAgent
  };
};

export const postMessage = (source: string, message: string, postData = {}) => {
  window.parent.postMessage(
    {
      fromErxes: true,
      source,
      message,
      ...postData
    },
    "*"
  );
};

type RequestBrowserInfoParams = {
  source: string;
  postData?: {};
  callback: (browserInfo: IBrowserInfo) => void;
};

export const requestBrowserInfo = ({
  source,
  postData = {},
  callback
}: RequestBrowserInfoParams) => {
  postMessage(source, "requestingBrowserInfo", postData);

  window.addEventListener("message", event => {
    const data = event.data || {};
    const { fromPublisher, message, browserInfo } = data;

    if (
      fromPublisher &&
      source === data.source &&
      message === "sendingBrowserInfo"
    ) {
      callback(browserInfo);
    }
  });
};

export const setMomentLocale = (code: string) => {
  moment.locale(code);
};

export const setLocale = (code?: string) => {
  T.setTexts(translation[code || "en"]);
  setMomentLocale(code || "en");
};

export const __ = (msg: string) => {
  return T.translate(msg);
};

export const scrollTo = (element: any, to: number, duration: number) => {
  const start = element.scrollTop;
  const change = to - start;
  const increment = 20;
  let currentTime = 0;

  const animateScroll = () => {
    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) {
        return (c / 2) * t * t + b;
      }
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    currentTime += increment;

    const val = easeInOutQuad(currentTime, start, change, duration);

    element.scrollTop = val;

    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };

  animateScroll();
};

export const makeClickableLink = (selector: string) => {
  const nodes = Array.from(document.querySelectorAll(selector));

  nodes.forEach(node => {
    node.setAttribute("target", "__blank");
  });
};

export const getEnv = (): ENV => {
  return (window as any).erxesEnv;
};

/*
 * Generate <host>/<integration kind> from <host>/<integration kind>Widget.bundle.js
 */
export const generateIntegrationUrl = (integrationKind: string): string => {
  const script =
    document.currentScript ||
    (() => {
      const scripts = document.getElementsByTagName("script");

      return scripts[scripts.length - 1];
    })();

  if (script && script instanceof HTMLScriptElement) {
    return script.src.replace(
      `/build/${integrationKind}Widget.bundle.js`,
      `/${integrationKind}`
    );
  }

  return "";
};

// check if valid url
const isValidURL = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

/**
 * Request to get file's URL for view and download
 * @param {String} - value
 * @return {String} - URL
 */
export const readFile = (value: string): string => {
  const { MAIN_API_URL } = getEnv();

  if (!value || isValidURL(value)) {
    return value;
  }

  return `${MAIN_API_URL}/read-file?key=${value}`;
};
