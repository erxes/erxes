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
              <Link to="/settings/channels">
                <Box>
                  <img src="/images/icons/channels.png" alt="channels" />
                  <BoxName>Channels</BoxName>
                </Box>
              </Link>
              <Link to="/settings/brands">
                <Box>
                  <img src="/images/icons/brands.png" alt="brands" />
                  <BoxName>Brands</BoxName>
                </Box>
              </Link>
              <Link to="/settings/integrations">
                <Box>
                  <img
                    src="/images/icons/integrations.png"
                    alt="integrations"
                  />
                  <BoxName>Integrations</BoxName>
                </Box>
              </Link>
              <Link to="/settings/response-templates">
                <Box>
                  <img
                    src="/images/icons/responseTe.png"
                    alt="responseTemplate"
                  />
                  <BoxName>Response Template</BoxName>
                </Box>
              </Link>
              <Link to="/settings/email-templates">
                <Box>
                  <img src="/images/icons/emailT.png" alt="emailTemplate" />
                  <BoxName>Email Template</BoxName>
                </Box>
              </Link>
              <Link to="/settings/emails">
                <Box>
                  <img src="/images/icons/emailA.png" alt="emailAppearance" />
                  <BoxName>Email Appearance</BoxName>
                </Box>
              </Link>
              <Link to="/settings/team">
                <Box className="last">
                  <img src="/images/icons/teamM.png" alt="teamMembers" />
                  <BoxName>Team Members</BoxName>
                </Box>
              </Link>
            </BoxContent>
          </Row>
          <Row>
            <RowTitle className="secondRow">Personal Settings</RowTitle>
            <Link to="/settings/profile">
              <Box>
                <img src="/images/icons/profile.png" alt="profile" />
                <BoxName>Profile</BoxName>
              </Box>
            </Link>
            <Link to="/settings/change-password">
              <Box>
                <img src="/images/icons/changePass.png" alt="changePassword" />
                <BoxName>Change password</BoxName>
              </Box>
            </Link>
            <Link to="/settings/emails/signatures">
              <Box>
                <img src="/images/icons/emailSig.png" alt="emailSignature" />
                <BoxName>Email Signature</BoxName>
              </Box>
            </Link>
            <Link to="/settings/notification-settings">
              <Box>
                <img src="/images/icons/notification.png" alt="notification" />
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
