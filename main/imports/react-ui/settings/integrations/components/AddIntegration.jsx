import React from 'react';
import { Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar.jsx';
import { InAppMessaging, Chat, Facebook } from '../containers';


function AddIntegration() {
  const triggerInApp = (
    <Button>
      <i className="ion-chatbubbles" /> Add in app messaging
    </Button>
  );

  const triggerChat = (
    <Button>
      <i className="ion-chatbubbles" /> Add chat
    </Button>
  );

  const triggerFb = (
    <Button>
      <i className="ion-social-facebook" /> Add facebook page
    </Button>
  );

  const content = (
    <div className="margined integration-types">
      <div className="box">
        <h2>In app messaging</h2>
        <ModalTrigger title="Add in app messaging" trigger={triggerInApp}>
          <InAppMessaging />
        </ModalTrigger>
      </div>

      <div className="box">
        <h2>Chat</h2>
        <ModalTrigger title="Add chat" trigger={triggerChat}>
          <Chat />
        </ModalTrigger>
      </div>

      <div className="box">
        <h2>Social integrations</h2>
        <Button href={FlowRouter.path('settings/integrations/twitter')}>
          <i className="ion-social-twitter" /> Add twitter
        </Button>
        <ModalTrigger title="Add facebook page" trigger={triggerFb}>
          <Facebook />
        </ModalTrigger>
      </div>
    </div>
  );

  const breadcrumb = [
    { title: 'Settings', link: '/settings/channels' },
    { title: 'Integrations', link: '/settings/integrations' },
    { title: 'Add Integrations' },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    </div>
  );
}

export default AddIntegration;
