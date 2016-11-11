import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';


function Navigation() {
  return (
    <aside className="navigation">
      <a href="/" className="logo">
        <img src="/assets/images/logo.png" alt="erxes" />
      </a>
      <nav className="nav-menu">
        <a href="/inbox">
          <i className="ion-email"></i>
        </a>
        <a href="/customers">
          <i className="ion-person-stalker"></i>
        </a>
        <a href={FlowRouter.path('settings/channels/list')}>
          <i className="ion-gear-a"></i>
        </a>
      </nav>
    </aside>
  );
}

export default Navigation;
