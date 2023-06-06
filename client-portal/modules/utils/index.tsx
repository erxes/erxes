import * as animations from "./animations";

import Alert from "./Alert";
import confirm from "./confirmation/confirm";
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

const renderUserFullName = (data) => {
  if (!data) {
    return null;
  }

  if (data.firstName || data.lastName) {
    return (data.firstName || "") + " " + (data.lastName || "");
  }

  if (data.email || data.username) {
    return data.email || data.username;
  }

  return "Unknown";
};

export {
  animations,
  parseMD,
  Alert,
  confirm,
  toggleCheckBoxes,
  urlParser,
  sendDesktopNotification,
  renderUserFullName,
};
