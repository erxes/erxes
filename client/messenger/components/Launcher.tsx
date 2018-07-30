import * as React from 'react';
import * as classNames from 'classnames';
import { Notifier } from '../containers';
import { IMessage, IIntegrationUiOptions } from '../types';

type Props = {
  onClick: (isMessengerVisible?: boolean) => void,
  isMessengerVisible: boolean,
  isBrowserInfoSaved: boolean,
  uiOptions: IIntegrationUiOptions,
  lastUnreadMessage?: IMessage,
  totalUnreadCount: number,
};

function Launcher(props: Props) {
  const {
    isMessengerVisible,
    isBrowserInfoSaved,
    onClick,
    uiOptions,
    lastUnreadMessage,
    totalUnreadCount,
  } = props;

  const clickHandler = () => {
    onClick(isMessengerVisible);
  };

  const launcherClasses = classNames('erxes-launcher', {
    close: isMessengerVisible,
  });

  const { color, logo } = uiOptions;

  const renderNotifier = () => {
    if (!isBrowserInfoSaved || isMessengerVisible) {
      return null;
    }

    return <Notifier message={lastUnreadMessage} />
  }

  const renderUnreadCount = () => {
    if (!isBrowserInfoSaved || !totalUnreadCount) {
      return null;
    }

    return <span>{totalUnreadCount}</span>
  }

  return (
    <div>
      <div
        className={launcherClasses}
        onClick={clickHandler}
        style={{
          backgroundColor: color,
          color: color,
          backgroundImage: logo ? `url(${logo})` : '',
          backgroundSize: logo ? '' : '20px',
        }}
      >
        {renderUnreadCount()}
      </div>

      {renderNotifier()}
    </div>
  );
}

export default Launcher;
