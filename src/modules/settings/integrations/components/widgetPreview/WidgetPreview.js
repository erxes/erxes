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
  StateSpan
} from './styles';
import { WidgetPreviewStyled } from 'modules/settings/styles';

function WidgetPreview({ color, wallpaper, user }) {
  const avatar =
    (user.details && user.details.avatar) || '/images/avatar-colored.png';
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
              <StateSpan />
              Online
            </ErxesState>
          </ErxesStaffProfile>
        </ErxesMiddle>
      </ErxesTopbar>
      <ErxesMessagesList className={backgroundClasses}>
        <ErxesWelcomeMessage>
          We welcome you warmly to erxes and look forward to a long term healthy
          working association with us.
        </ErxesWelcomeMessage>
        <li>
          <ErxesAvatar>
            <img src={avatar} alt="avatar" />
          </ErxesAvatar>
          <ErxesMessage>Hi, any questions?</ErxesMessage>
          <ErxesDate>1 hour ago</ErxesDate>
        </li>
        <ErxesFromCustomer>
          <FromCustomer style={{ backgroundColor: color }}>
            We need your help!
          </FromCustomer>
          <ErxesDate>6 minutes ago</ErxesDate>
        </ErxesFromCustomer>
      </ErxesMessagesList>
      <ErxesMessageSender>
        <span>Write a reply ...</span>
      </ErxesMessageSender>
    </WidgetPreviewStyled>
  );
}

WidgetPreview.propTypes = {
  color: PropTypes.string.isRequired,
  wallpaper: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired // eslint-disable-line
};

export default WidgetPreview;
