import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import {
  ErxesAvatar,
  ErxesDate,
  ErxesFromCustomer,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesMiddle,
  ErxesSpacialMessage,
  ErxesStaffName,
  ErxesStaffProfile,
  ErxesState,
  ErxesTopbar,
  FromCustomer,
  StateSpan,
  TopbarButton,
  WidgetPreviewStyled
} from './styles';

type Props = {
  color: string;
  wallpaper: string;
  users: IUser[];
  supporterIds?: string[];
  welcomeMessage?: string;
  awayMessage?: string;
  isOnline?: boolean;
};

function WidgetPreview({
  color,
  wallpaper,
  users,
  supporterIds,
  welcomeMessage,
  awayMessage,
  isOnline
}: Props) {
  let avatar = [<img key="1" src="/images/avatar-colored.svg" alt="avatar" />];
  let fullName = 'Support staff';

  const supporters = users.filter(user =>
    (supporterIds || []).includes(user._id || '')
  );

  if (supporters.length > 0) {
    avatar = supporters.map(u => {
      const details = u.details || {};

      return <img key={u._id} src={details.avatar} alt={details.fullName} />;
    });
  }

  if ((supporterIds || []).length > 0) {
    fullName = supporters
      .map(user => user.details && user.details.fullName)
      .join(', ');
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
              <StateSpan state={isOnline || false} />
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

export default WidgetPreview;
