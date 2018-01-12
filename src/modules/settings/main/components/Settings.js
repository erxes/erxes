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
  Container
} from '../styles';

class Settings extends Component {
  render() {
    return (
      <Maincontent>
        <Header key="breadcrumb" breadcrumb={this.breadcrumb()} />
        <Container>
          <Row>
            <RowTitle>Account Settings</RowTitle>
            <BoxContent>
              <Link to="/settings/channels">
                <Box>
                  <img src="/images/channels.png" alt="channels" />
                  <BoxName>Channels</BoxName>
                </Box>
              </Link>
              <Link to="/settings/brands">
                <Box>
                  <img src="/images/brands.png" alt="brands" />
                  <BoxName>Brands</BoxName>
                </Box>
              </Link>
              <Link to="/settings/integrations">
                <Box>
                  <img src="/images/integrations.png" alt="integrations" />
                  <BoxName>Integrations</BoxName>
                </Box>
              </Link>
              <Link to="/settings/response-templates">
                <Box>
                  <img src="/images/responseTe.png" alt="responseTe" />
                  <BoxName>Response Template</BoxName>
                </Box>
              </Link>
              <Link to="/settings/email-templates">
                <Box>
                  <img src="/images/emailT.png" alt="emailT" />
                  <BoxName>Email Template</BoxName>
                </Box>
              </Link>
              <Link to="/settings/emails">
                <Box>
                  <img src="/images/emailA.png" alt="emailA" />
                  <BoxName>Email Appearance</BoxName>
                </Box>
              </Link>
              <Link to="/settings/team">
                <Box className="last">
                  <img src="/images/teamM.png" alt="teamM" />
                  <BoxName>Team Members</BoxName>
                </Box>
              </Link>
            </BoxContent>
          </Row>
          <Row>
            <RowTitle className="secondRow">Personal Settings</RowTitle>
            <Link to="/settings/profile">
              <Box>
                <img src="/images/profile.png" alt="profile" />
                <BoxName>Profile</BoxName>
              </Box>
            </Link>
            <Link to="/settings/change-password">
              <Box>
                <img src="/images/changePass.png" alt="changePass" />
                <BoxName>Change password</BoxName>
              </Box>
            </Link>
            <Link to="/settings/emails/signatures">
              <Box>
                <img src="/images/emailSig.png" alt="emailSig" />
                <BoxName>Email Signature</BoxName>
              </Box>
            </Link>
            <Link to="/settings/notification-settings">
              <Box>
                <img src="/images/notification.png" alt="notification" />
                <BoxName>Notification</BoxName>
              </Box>
            </Link>
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
