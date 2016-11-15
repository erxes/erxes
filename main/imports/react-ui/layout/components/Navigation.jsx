import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tip } from '/imports/react-ui/common';


function Navigation() {
  return (
    <aside className="navigation">
      <a href="/" className="logo">
        <img src="/assets/images/logo.png" alt="erxes" />
      </a>
      <nav className="nav-menu">
        <Tip placement="right" text="Inbox">
          <a href="/inbox">
            <i className="ion-email"></i>
          </a>
        </Tip>
        <Tip placement="right" text="Customers">
          <a href="/customers">
            <i className="ion-person-stalker"></i>
          </a>
        </Tip>
        <Tip placement="right" text="Settings">
          <a href={FlowRouter.path('settings/channels/list')}>
            <i className="ion-gear-a"></i>
          </a>
        </Tip>
      </nav>
    </aside>
  );
}

export default Navigation;
