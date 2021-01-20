import * as classNames from "classnames";
import * as React from "react";
import { IBrowserInfo, IIntegrationUiOptions } from "../../types";
import { readFile } from "../../utils";
import { Notifier } from "../containers";
import { IMessage } from "../types";

type Props = {
  onClick: (isMessengerVisible?: boolean) => void;
  isMessengerVisible: boolean;
  isBrowserInfoSaved: boolean;
  uiOptions: IIntegrationUiOptions;
  lastUnreadMessage?: IMessage;
  totalUnreadCount: number;
  browserInfo: IBrowserInfo;
};

function Launcher(props: Props) {
  const {
    isMessengerVisible,
    isBrowserInfoSaved,
    onClick,
    uiOptions,
    lastUnreadMessage,
    totalUnreadCount,
    browserInfo
  } = props;

  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  const launcherClasses = classNames("erxes-launcher", {
    close: isMessengerVisible
  });

  const { color, logo } = uiOptions;

  const renderNotifier = () => {
    if (!isBrowserInfoSaved || isMessengerVisible) {
      return null;
    }

    return <Notifier message={lastUnreadMessage} browserInfo={browserInfo} />;
  };

  const renderUnreadCount = () => {
    if (!isBrowserInfoSaved || !totalUnreadCount) {
      return null;
    }

    return <span>{totalUnreadCount}</span>;
  };

  return (
    <>
      <a
        className={launcherClasses}
        onClick={clickHandler}
        style={{
          backgroundColor: color,
          color,
          backgroundImage: logo ? `url(${readFile(logo)})` : "",
          backgroundSize: logo ? "" : "20px"
        }}
      >
        <div />
        {renderUnreadCount()}
      </a>

      {renderNotifier()}
    </>
  );
}

export default Launcher;
