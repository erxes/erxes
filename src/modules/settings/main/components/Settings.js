import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Header } from 'modules/layout/components';
import {
  Maincontent,
  Row,
  RowTitle,
  Box,
  BoxContent,
  BoxName
} from '../styles';

class Settings extends Component {
  render() {
    return (
      <Maincontent>
        <Header key="breadcrumb" breadcrumb={this.breadcrumb()} />
        <Row>
          <RowTitle>Account Settings</RowTitle>
          <BoxContent>
            <NavLink activeClassName="active" to="/channels">
              <Box>
                <img src="/images/channels.png" alt="channels" />
                <BoxName>Channels</BoxName>
              </Box>
            </NavLink>
            <NavLink activeClassName="active" to="/settings/brands">
              <Box>
                <img src="/images/brands.png" alt="brands" />
                <BoxName>Brands</BoxName>
              </Box>
            </NavLink>
            <Link to="/settings/integrations">
              <Box>
                <img src="/images/integrations.png" alt="integrations" />
                <BoxName>Integrations</BoxName>
              </Box>
            </Link>
            <NavLink activeClassName="active" to="/settings/response-templates">
              <Box>
                <img src="/images/responseTe.png" alt="responseTe" />
                <BoxName>Response Template</BoxName>
              </Box>
            </NavLink>
            <NavLink activeClassName="active" to="/settings/email-templates">
              <Box>
                <img src="/images/emailT.png" alt="emailT" />
                <BoxName>Email Template</BoxName>
              </Box>
            </NavLink>
            <NavLink activeClassName="active" to="/settings/emails">
              <Box>
                <img src="/images/emailA.png" alt="emailA" />
                <BoxName>Email Appearance</BoxName>
              </Box>
            </NavLink>
            <NavLink activeClassName="active" to="/settings/team">
              <Box>
                <img src="/images/teamM.png" alt="teamM" />
                <BoxName>Team Members</BoxName>
              </Box>
            </NavLink>
          </BoxContent>
        </Row>
        <Row>
          <RowTitle className="second">Personal Settings</RowTitle>
          <NavLink activeClassName="active" to="/settings/profile">
            <Box>
              <img src="/images/profile.png" alt="profile" />
              <BoxName>Profile</BoxName>
            </Box>
          </NavLink>
          <NavLink activeClassName="active" to="/settings/change-password">
            <Box>
              <img src="/images/changePass.png" alt="changePass" />
              <BoxName>Change password</BoxName>
            </Box>
          </NavLink>
          <NavLink activeClassName="active" to="/settings/emails/signatures">
            <Box>
              <img src="/images/emailSig.png" alt="emailSig" />
              <BoxName>Email Signature</BoxName>
            </Box>
          </NavLink>
          <NavLink
            activeClassName="active"
            to="/settings/notification-settings"
          >
            <Box>
              <img src="/images/notification.png" alt="notification" />
              <BoxName>Notification</BoxName>
            </Box>
          </NavLink>
        </Row>
      </Maincontent>
    );
  }

  breadcrumb() {
    return [{ title: 'Settings', link: '/settings' }];
  }
}

export default Settings;
