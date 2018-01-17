import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header } from 'modules/layout/components';
import {
  Maincontent,
  Row,
  RowTitle,
  Box,
  BoxContent,
  BoxName,
  Container,
  Contents
} from '../styles';

class Settings extends Component {
  renderBox(name, image, to) {
    return (
      <Link to={to}>
        <Box>
          <img src={image} alt={name} />
          <BoxName>{name}</BoxName>
        </Box>
      </Link>
    );
  }

  render() {
    return (
      <Maincontent>
        <Contents>
          <Header key="breadcrumb" breadcrumb={this.breadcrumb()} />
        </Contents>
        <Container>
          <Row>
            <RowTitle>Account Settings</RowTitle>

            <BoxContent>
              {this.renderBox(
                'Channels',
                '/images/icons/channels.png',
                '/settings/channels'
              )}
              {this.renderBox(
                'Brands',
                '/images/icons/brands.png',
                '/settings/brands'
              )}
              {this.renderBox(
                'Integrations',
                '/images/icons/integrations.png',
                '/settings/integrations'
              )}
              {this.renderBox(
                'Response Template',
                '/images/icons/responseTe.png',
                '/settings/response-templates'
              )}
              {this.renderBox(
                'Email Template',
                '/images/icons/emailT.png',
                '/settings/email-templates'
              )}
              {this.renderBox(
                'Email Appearance',
                '/images/icons/emailA.png',
                '/settings/emails'
              )}
              {this.renderBox(
                'Forms',
                '/images/icons/forms.png',
                '/settings/forms'
              )}
              {this.renderBox(
                'Knowledge base',
                '/images/icons/knowledgeBase.png',
                '/settings/knowledgebase/list'
              )}
              {this.renderBox(
                'Team Members',
                '/images/icons/teamM.png',
                '/settings/team'
              )}
            </BoxContent>
          </Row>
          <Row>
            <RowTitle className="secondRow">Personal Settings</RowTitle>

            {this.renderBox(
              'Profile',
              '/images/icons/profile.png',
              '/settings/profile'
            )}
            {this.renderBox(
              'Change password',
              '/images/icons/changePass.png',
              '/settings/change-password'
            )}
            {this.renderBox(
              'Email Signature',
              '/images/icons/emailSig.png',
              '/settings/emails/signatures'
            )}
            {this.renderBox(
              'Notification',
              '/images/icons/notification.png',
              '/settings/notification-settings'
            )}
          </Row>
        </Container>
      </Maincontent>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings' }];
  }
}

export default Settings;
