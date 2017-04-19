import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

function Sidebar() {
  const { Title, QuickButtons } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Account settings</Title>
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
            <a href={FlowRouter.path('settings/responseTemplates/list')}>
              <i className="icon ion-arrow-right-b" />Response templates
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/emails/list')}>
              <i className="icon ion-arrow-right-b" />Email appearance
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('settings/forms/list')}>
              <i className="icon ion-arrow-right-b" />Forms
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <Title>Integrations</Title>
        <QuickButtons>
          <a href={FlowRouter.path('settings/integrations/list')} className="quick-button">
            All
          </a>
        </QuickButtons>
        <ul className="filters">
          <li>
            <a href={'/settings/integrations?kind=in_app_messaging'}>
              <i className="icon ion-arrow-right-b" />Inn app messaging
            </a>
          </li>
          <li>
            <a href={'/settings/integrations?kind=chat'}>
              <i className="icon ion-arrow-right-b" />Chat
            </a>
          </li>
          <li>
            <a href={'/settings/integrations?kind=form'}>
              <i className="icon ion-arrow-right-b" />Form
            </a>
          </li>
          <li>
            <a href={'/settings/integrations?kind=twitter'}>
              <i className="icon ion-arrow-right-b" />Twitter
            </a>
          </li>
          <li>
            <a href={'/settings/integrations?kind=facebook'}>
              <i className="icon ion-arrow-right-b" />Facebook
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <Title>Personal settings</Title>
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
