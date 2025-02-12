import * as React from "react";

import { BotPersistentMenuTypeMessenger } from "../types";
import { IIntegrationMessengerData } from "../../types";
import { __ } from "../../utils";
import { iconMenu } from "../../icons/Icons";
import { useMessage } from "../context/Message";

type Props = {
  messengerData: IIntegrationMessengerData;
};

const PersistentMenu: React.FC<Props> = ({ messengerData }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const togglePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const hidePicker = () => {
    setIsVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      hidePicker();
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isVisible]);

  const { replyAutoAnswer } = useMessage();
  const { persistentMenus = [], getStarted = false } = messengerData || {};

  const renderPersistentMenu = (pmenu: BotPersistentMenuTypeMessenger) => {
    const { type, _id, text, link } = pmenu;

    if (type === "link") {
      return (
        <a className="card-action p-menu" target="_blank" href={link}>
          {text}
        </a>
      );
    }

    const handleClick = () => {
      replyAutoAnswer(text, _id, "persistentMenuId");
      hidePicker();
    };

    return (
      <li key={_id} className="p-menu" onClick={handleClick}>
        {text}
      </li>
    );
  };

  const renderGetStarted = () => {
    if (!getStarted) {
      return null;
    }

    const handleGetStarted = () => {
      replyAutoAnswer("Get Started", "", "getStarted");
      hidePicker();
    };

    return (
      <li className="p-menu" onClick={handleGetStarted}>
        {__("Get started")}
      </li>
    );
  };

  if (!persistentMenus || persistentMenus.length === 0) {
    return null;
  }

  return (
    <div className="persistent-menu-wrapper" ref={menuRef}>
      <button title="View menu options" onClick={togglePicker} type="button">
        {iconMenu}
      </button>
      {isVisible ? (
        <ul>
          {renderGetStarted()}
          {persistentMenus.map((pMenu) => renderPersistentMenu(pMenu))}
        </ul>
      ) : null}
    </div>
  );
};

export default PersistentMenu;
