import React from 'react';
import PropTypes from 'prop-types';
import {
  ErxesTopbar,
  TopbarButton,
  ErxesMiddle,
  ErxesStaffProfile,
  ErxesStaffName,
  ErxesMessage,
  ErxesSpacialMessage,
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
  {
    color,
    wallpaper,
    users,
    supporterIds,
    welcomeMessage,
    awayMessage,
    isOnline
  },
  { __ }
) {
  let avatar = <img src="/images/avatar-colored.svg" alt="avatar" />;
  let fullName = 'Support staff';

  const supporters = users.filter(user => supporterIds.includes(user._id));

  if (supporters.length > 0) {
    avatar = supporters.map(u => {
      return (
        <img key={u._id} src={u.details.avatar} alt={u.details.fullName} />
      );
    });
  }

  if (supporterIds.length > 0) {
    fullName = supporters.map(user => user.details.fullName).join(', ');
  }

  const renderMessage = message => {
    if (!message) {
      return null;
    }
    return <ErxesSpacialMessage>{message}</ErxesSpacialMessage>;
  };

  const backgroundClasses = `background-${wallpaper}`;

  return (
    <WidgetPreviewStyled>
      <ErxesTopbar style={{ backgroundColor: color }}>
        <TopbarButton />
        <ErxesMiddle>
          <ErxesStaffProfile>
            {avatar}
            <ErxesStaffName>{fullName}</ErxesStaffName>
            <ErxesState>
              <StateSpan state={isOnline} />
              {isOnline ? __('Online') : __('Offline')}
            </ErxesState>
          </ErxesStaffProfile>
        </ErxesMiddle>
      </ErxesTopbar>
      <ErxesMessagesList className={backgroundClasses}>
        {isOnline && renderMessage(welcomeMessage)}
        <li>
          <ErxesAvatar>
            <img src="/images/avatar-colored.svg" alt="avatar" />
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
        {!isOnline && renderMessage(awayMessage)}
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
  users: PropTypes.array,
  supporterIds: PropTypes.array,
  welcomeMessage: PropTypes.string,
  awayMessage: PropTypes.string,
  isOnline: PropTypes.bool
};

WidgetPreview.contextTypes = {
  __: PropTypes.func
};

export default WidgetPreview;
