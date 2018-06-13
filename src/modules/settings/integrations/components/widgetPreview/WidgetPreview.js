import React from 'react';
import PropTypes from 'prop-types';
import {
  ErxesTopbar,
  TopbarButton,
  ErxesMiddle,
  ErxesStaffProfile,
  ErxesStaffName,
  ErxesMessage,
  ErxesWelcomeMessage,
  ErxesAvatar,
  ErxesDate,
  ErxesMessageSender,
  ErxesFromCustomer,
  ErxesMessagesList,
  ErxesState,
  FromCustomer,
  StateSpan,
  WidgetPreviewStyled
} from './styles';

function WidgetPreview(
  { color, wallpaper, user, welcomeMessage, isOnline },
  { __ }
) {
  const avatar =
    (user.details && user.details.avatar) || '/images/avatar-colored.svg';
  console.log(user);
  const fullName = (user.details && user.details.fullName) || 'Support staff';
  const backgroundClasses = `background-${wallpaper}`;

  return (
    <WidgetPreviewStyled>
      <ErxesTopbar style={{ backgroundColor: color }}>
        <TopbarButton />
        <ErxesMiddle>
          <ErxesStaffProfile>
            <img src={avatar} alt={fullName} />
            <ErxesStaffName>{fullName}</ErxesStaffName>
            <ErxesState>
              <StateSpan state={isOnline} />
              {isOnline ? __('Online') : __('Offline')}
            </ErxesState>
          </ErxesStaffProfile>
        </ErxesMiddle>
      </ErxesTopbar>
      <ErxesMessagesList className={backgroundClasses}>
        <ErxesWelcomeMessage>{welcomeMessage}</ErxesWelcomeMessage>
        <li>
          <ErxesAvatar>
            <img src={avatar} alt="avatar" />
          </ErxesAvatar>
          <ErxesMessage>{__('Hi, any questions?')}</ErxesMessage>
          <ErxesDate>{__('1 hour ago')}</ErxesDate>
        </li>
        <ErxesFromCustomer>
          <FromCustomer style={{ backgroundColor: color }}>
            {__('We need your help!')}
          </FromCustomer>
          <ErxesDate>{__('6 minutes ago')}</ErxesDate>
        </ErxesFromCustomer>
      </ErxesMessagesList>
      <ErxesMessageSender>
        <span>{__('Write a reply ...')}</span>
      </ErxesMessageSender>
    </WidgetPreviewStyled>
  );
}

WidgetPreview.propTypes = {
  color: PropTypes.string.isRequired,
  wallpaper: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line,
  welcomeMessage: PropTypes.string,
  isOnline: PropTypes.bool
};

WidgetPreview.contextTypes = {
  __: PropTypes.func
};

export default WidgetPreview;
