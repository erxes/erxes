import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';


function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Account settings</h3>
        <ul className="filters">
          <li>
            <a href={FlowRouter.path('settings/channels/list')}>
              <i className="icon ion-arrow-right-b" />Channels
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/brands/list')}>
              <i className="icon ion-arrow-right-b" />Brands
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/team/list')}>
              <i className="icon ion-arrow-right-b" />Team members
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/emails/list')}>
              <i className="icon ion-arrow-right-b" />Email appearance
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <h3>Integrations</h3>
        <ul className="filters">
          <li>
            <a href={FlowRouter.path('settings/integrations/list')}>
              <i className="icon ion-arrow-right-b" />List
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/integrations/in_app_messaging')}>
              <i className="icon ion-arrow-right-b" />Inn app messaging
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/integrations/twitter')}>
              <i className="icon ion-arrow-right-b" />Twitter
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <h3>Personal settings</h3>
        <ul className="filters">
          <li>
            <a href={FlowRouter.path('/settings/profile')}>
              <i className="icon ion-arrow-right-b" />Profile
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/change-password')}>
              <i className="icon ion-arrow-right-b" />Change password
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/emails/signatures')}>
              <i className="icon ion-arrow-right-b" />Email signatures
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/notification-settings')}>
              <i className="icon ion-arrow-right-b" />Notification settings
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
