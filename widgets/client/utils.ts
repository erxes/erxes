import T from "i18n-react";
import * as moment from "moment";
import "moment/locale/mn";
import { ENV, IBrowserInfo, IRule } from "./types";

export const getEnv = (): ENV => {
  return (window as any).erxesEnv;
};

declare const window: any;

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

export const getBrowserInfo = async () => {
  if (window.location.hostname === "localhost") {
    return {
      url: window.location.pathname,
      hostname: window.location.origin,
      language: navigator.language,
      userAgent: navigator.userAgent
    };
  }

  let location;

  try {
    const response = await fetch("https://geo.erxes.io");

    location = await response.json();
  } catch (e) {
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

  window.addEventListener("message", (event: any) => {
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
  import(`../locales/${code}.json`)
    .then(translations => {
      T.setTexts(translations);
      setMomentLocale(code || "en");
    })
    .catch(e => console.log(e)); // tslint:disable-line
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
  const { API_URL } = getEnv();

  if (!value || isValidURL(value) || value.includes("/")) {
    return value;
  }

  return `${API_URL}/read-file?key=${value}`;
};

export const checkRule = async (rule: IRule, browserInfo: IBrowserInfo) => {
  const { language, url, city, country } = browserInfo || ({} as IBrowserInfo);
  const { value, kind, condition } = rule;
  const ruleValue: any = value;

  let valueToTest: any;

  if (kind === "browserLanguage") {
    valueToTest = language;
  }

  if (kind === "currentPageUrl") {
    valueToTest = url;
  }

  if (kind === "city") {
    valueToTest = city;
  }

  if (kind === "country") {
    valueToTest = country;
  }

  // is
  if (condition === "is" && valueToTest !== ruleValue) {
    return false;
  }

  // isNot
  if (condition === "isNot" && valueToTest === ruleValue) {
    return false;
  }

  // isUnknown
  if (condition === "isUnknown" && valueToTest) {
    return false;
  }

  // hasAnyValue
  if (condition === "hasAnyValue" && !valueToTest) {
    return false;
  }

  // startsWith
  if (
    condition === "startsWith" &&
    valueToTest &&
    !valueToTest.startsWith(ruleValue)
  ) {
    return false;
  }

  // endsWith
  if (
    condition === "endsWith" &&
    valueToTest &&
    !valueToTest.endsWith(ruleValue)
  ) {
    return false;
  }

  // contains
  if (
    condition === "contains" &&
    valueToTest &&
    !valueToTest.includes(ruleValue)
  ) {
    return false;
  }

  // greaterThan
  if (condition === "greaterThan" && valueToTest < parseInt(ruleValue, 10)) {
    return false;
  }

  if (condition === "lessThan" && valueToTest > parseInt(ruleValue, 10)) {
    return false;
  }

  if (condition === "doesNotContain" && valueToTest.includes(ruleValue)) {
    return false;
  }

  return true;
};

export const checkRules = async (
  rules: IRule[],
  browserInfo: IBrowserInfo
): Promise<boolean> => {
  let passedAllRules = true;

  for (const rule of rules) {
    const result = await checkRule(rule, browserInfo);

    if (result === false) {
      passedAllRules = false;
    }
  }

  return passedAllRules;
};

export const striptags = (htmlString: string) => {
  const _div = document.createElement("div");
  let _text = "";

  _div.innerHTML = htmlString;
  _text = _div.textContent ? _div.textContent.trim() : "";
  _text = _text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
  return _text;
};

export const fixErrorMessage = (msg: string) =>
  msg.replace("GraphQL error: ", "");

export const setErxesProperty = (name: string, value: any) => {
  const erxes = window.Erxes || {};

  erxes[name] = value;

  window.Erxes = erxes;
};
