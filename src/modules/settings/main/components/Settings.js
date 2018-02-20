import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { Row, RowTitle, Box, Divider, BoxName } from '../styles';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  settings: {
    id: 'settings',
    defaultMessage: 'Settings'
  },
  accountSettings: {
    id: 'accountSettings',
    defaultMessage: 'Account Settings'
  },
  personalSettings: {
    id: 'personalSettings',
    defaultMessage: 'Personal Settings'
  },
  channelSettings: {
    id: 'channelSettings',
    defaultMessage: 'Channels'
  },
  brandSettings: {
    id: 'brandSettings',
    defaultMessage: 'Brands'
  },
  integrationSettings: {
    id: 'integrationSettings',
    defaultMessage: 'Integrations'
  },
  responseTemplateSettings: {
    id: 'responseTemplateSettings',
    defaultMessage: 'Response Template'
  },
  emailTemplateSettings: {
    id: 'emailTemplateSettings',
    defaultMessage: 'Email Template'
  },
  emailAppearanceSettings: {
    id: 'emailAppearanceSettings',
    defaultMessage: 'Email Appearance'
  },
  formSettings: {
    id: 'formSettings',
    defaultMessage: 'Forms'
  },
  teamMemberSettings: {
    id: 'teamMemberSettings',
    defaultMessage: 'Team Members'
  },
  profileSettings: {
    id: 'profileSettings',
    defaultMessage: 'Profile'
  },
  changePasswordSettings: {
    id: 'changePasswordSettings',
    defaultMessage: 'Change password'
  },
  emailSignatureSettings: {
    id: 'emailSignatureSettings',
    defaultMessage: 'Email Signature'
  },
  notificationSettings: {
    id: 'notificationSettings',
    defaultMessage: 'Notification'
  }
});

class Settings extends Component {
  renderBox(name, image, to) {
    return (
      <Box>
        <Link to={to}>
          <img src={image} alt={name} />
          <BoxName>{name}</BoxName>
        </Link>
      </Box>
    );
  }

  render() {
    const { __ } = this.context;
    const {
      settings,
      accountSettings,
      personalSettings,
      channelSettings,
      brandSettings,
      integrationSettings,
      responseTemplateSettings,
      emailTemplateSettings,
      emailAppearanceSettings,
      formSettings,
      teamMemberSettings,
      profileSettings,
      changePasswordSettings,
      emailSignatureSettings,
      notificationSettings
    } = messages;

    const breadcrumb = [{ title: __(settings), link: '/settings' }];

    const content = (
      <div>
        <Row>
          <RowTitle>{__(accountSettings)}</RowTitle>
          <div>
            {this.renderBox(
              __(channelSettings),
              '/images/icons/erxes-05.svg',
              '/settings/channels'
            )}
            {this.renderBox(
              __(brandSettings),
              '/images/icons/erxes-03.svg',
              '/settings/brands'
            )}
            {this.renderBox(
              __(integrationSettings),
              '/images/icons/erxes-04.svg',
              '/settings/integrations'
            )}
            {this.renderBox(
              __(responseTemplateSettings),
              '/images/icons/erxes-10.svg',
              '/settings/response-templates'
            )}
            {this.renderBox(
              __(emailTemplateSettings),
              '/images/icons/erxes-09.svg',
              '/settings/email-templates'
            )}
            {this.renderBox(
              __(emailAppearanceSettings),
              '/images/icons/erxes-08.svg',
              '/settings/emails'
            )}
            {this.renderBox(
              __(formSettings),
              '/images/icons/erxes-12.svg',
              '/settings/forms'
            )}
            {this.renderBox(
              __(teamMemberSettings),
              '/images/icons/erxes-02.svg',
              '/settings/team'
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle className="secondRow">{__(personalSettings)}</RowTitle>
          <div>
            {this.renderBox(
              __(profileSettings),
              '/images/icons/erxes-01.svg',
              '/settings/profile'
            )}
            {this.renderBox(
              __(changePasswordSettings),
              '/images/icons/erxes-13.svg',
              '/settings/change-password'
            )}
            {this.renderBox(
              __(emailSignatureSettings),
              '/images/icons/erxes-07.svg',
              '/settings/emails/signatures'
            )}
            {this.renderBox(
              __(notificationSettings),
              '/images/icons/erxes-11.svg',
              '/settings/notification-settings'
            )}
          </div>
        </Row>
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

Settings.contextTypes = {
  __: PropTypes.func
};

export default Settings;
