/* global FileReader */
import T from "i18n-react";
import * as moment from "moment";
import "moment/locale/mn";
import translation from "../locales";
import { IBrowserInfo } from "./types";

export const getBrowserInfo = async () => {
  let location;
  try {
    const response = await fetch("https://json.geoiplookup.io/api");

    location = await response.json();
  } catch (e) {
    console.log(e.message); // eslint-disable-line

    location = {
      city: "",
      remoteAddress: "",
      region: "",
      country: ""
    };
  }

  return {
    remoteAddress: location.ip,
    region: location.region,
    city: location.city,
    country: location.country_name,
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
