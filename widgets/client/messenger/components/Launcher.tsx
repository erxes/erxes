import * as classNames from 'classnames';
import * as React from 'react';
import { IBrowserInfo, IIntegrationUiOptions } from '../../types';
import { readFile } from '../../utils';
import Notifier from '../containers/Notifier';
import { IconChat, IconPhone, IconTicket } from './BottomNavBar/Icons';
import Button from './common/Button';
import { useRouter } from '../context/Router';

type Props = {
  onClick: (isMessengerVisible?: boolean) => void;
  isMessengerVisible: boolean;
  isBrowserInfoSaved: boolean;
  uiOptions: IIntegrationUiOptions;
  totalUnreadCount: number;
  browserInfo: IBrowserInfo;
};

function Launcher(props: Props) {
  const {
    isMessengerVisible,
    isBrowserInfoSaved,
    onClick,
    uiOptions,
    totalUnreadCount,
    browserInfo,
  } = props;
  const { setActiveRoute } = useRouter();
  const [shouldShowControls, setShouldShowControls] = React.useState(true);
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

    return <Notifier browserInfo={browserInfo} />;
  };

  const renderUnreadCount = () => {
    if (!isBrowserInfoSaved || !totalUnreadCount) {
      return null;
    }

    return <span>{totalUnreadCount}</span>;
  };
  const toggleControlList = () => {
    setShouldShowControls(!shouldShowControls);
  };
  const handleAction = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(false);
    setActiveRoute(route);
  };
  const renderHoverControls = () => {
    // if (!shouldShowControls) return null;
    return (
      <ul
        className="control-list"
        role="menu"
        tabIndex={-1}
        aria-expanded={shouldShowControls}
      >
        <li className="hover-control-item">
          <Button
            icon={<IconPhone filled />}
            withDefaultStyle
            onClick={handleAction('call')}
          />
        </li>
        <li className="hover-control-item">
          <Button
            icon={<IconChat filled />}
            withDefaultStyle
            onClick={handleAction('allConversations')}
          />
        </li>
        <li className="hover-control-item">
          <Button
            icon={<IconTicket filled />}
            withDefaultStyle
            onClick={handleAction('ticket')}
          />
        </li>
      </ul>
    );
  };

  return (
    <div
      className={`erxes-launcher-container ${shouldShowControls ? '' : 'launcher-hovered'}`}
      onMouseLeave={() => setShouldShowControls(false)}
    >
      <a
        className={launcherClasses}
        onClick={clickHandler}
        style={{
          backgroundColor: color,
          color,
          backgroundImage: logo ? `url(${readFile(logo, 30)})` : '',
          backgroundSize: logo ? '' : '20px',
        }}
        onMouseEnter={toggleControlList}
      ></a>
      {renderNotifier()}
    </div>
  );
}

export default Launcher;
