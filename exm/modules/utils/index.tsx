import * as animations from "./animations";

import Alert from "./Alert";
import { IUserDoc } from "../auth/types";
import React from "react";
import confirm from "./confirmation/confirm";
import { getEnv } from "../../utils/configs";
import parseMD from "./parseMd";
import toggleCheckBoxes from "./toggleCheckBoxes";
import urlParser from "./urlParser";

const sendDesktopNotification = (doc: { title: string; content?: string }) => {
  const notify = () => {
    // Don't send notification to itself
    if (!window.document.hidden) {
      return;
    }

    const notification = new Notification(doc.title, {
      body: doc.content,
      icon: "/favicon.png",
      dir: "ltr",
    });

    // notify by sound
    const audio = new Audio("/sound/notify.mp3");
    audio.play();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Browser doesn't support Notification api
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    return notify();
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission((permission) => {
      if (!("permission" in Notification)) {
        (Notification as any).permission = permission;
      }

      if (permission === "granted") {
        return notify();
      }
    });
  }
};

export const getThemeItem = (code) => {
  const configs = JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("erxes_theme_configs")
      : "[]"
  );
  const config = (configs || []).find(
    (c) => c.code === `THEME_${code.toUpperCase()}`
  );

  return config ? config.value : "";
};

export const bustIframe = () => {
  if (window.self === window.top) {
    const antiClickjack = document.getElementById("anti-clickjack");

    if (antiClickjack && antiClickjack.parentNode) {
      antiClickjack.parentNode.removeChild(antiClickjack);
    }
  } else {
    window.top.location = window.self.location;
  }
};

export const cleanIntegrationKind = (name: string) => {
  if (name.includes("nylas")) {
    name = name.replace("nylas-", "");
  }
  if (name.includes("smooch")) {
    name = name.replace("smooch-", "");
  }
  if (name === "lead") {
    name = "forms";
  }
  return name;
};

export const setTitle = (title: string, force: boolean) => {
  if (!document.title.includes(title) || force) {
    document.title = title;
  }
};

export function withProps<IProps>(
  Wrapped: new (props: IProps) => React.Component<IProps>
) {
  return class WithProps extends React.Component<IProps, {}> {
    render() {
      return <Wrapped {...this.props} />;
    }
  };
}

export const readFile = (value: string): string => {
  if (
    !value ||
    urlParser.isValidURL(value) ||
    value.includes("http") ||
    value.startsWith("/")
  ) {
    return value;
  }

  const { REACT_APP_API_URL } = getEnv();

  return `${REACT_APP_API_URL}/read-file?key=${value}`;
};

export const getUserAvatar = (user: IUserDoc) => {
  if (!user) {
    return "";
  }

  const details = user.details;

  if (!details || !details.avatar) {
    return "/images/avatar-colored.svg";
  }

  return readFile(details.avatar);
};

export {
  animations,
  parseMD,
  Alert,
  confirm,
  toggleCheckBoxes,
  urlParser,
  sendDesktopNotification,
};
