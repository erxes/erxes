import React from 'react';
import { Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import { Messenger, Form, Facebook, KbGroup } from '../containers';

function AddIntegration() {
  const triggerMessenger = (
    <Button>
      <i className="ion-chatbubbles" /> Add messenger
    </Button>
  );

  const triggerForm = (
    <Button>
      <i className="ion-formbubbles" /> Add form
    </Button>
  );

  const triggerFb = (
    <Button>
      <i className="ion-social-facebook" /> Add facebook page
    </Button>
  );

  const triggerKbGroup = (
    <Button>
      <i className="ion-social-kb" /> Add kb group
    </Button>
  );

  const content = (
    <div className="margined type-box">
      <div className="box">
        <h2>Messenger</h2>

        <ModalTrigger title="Add messenger" trigger={triggerMessenger}>
          <Messenger />
        </ModalTrigger>
      </div>

      <div className="box">
        <h2>Form</h2>
        <ModalTrigger title="Add form" trigger={triggerForm}>
          <Form />
        </ModalTrigger>
      </div>

      <div className="box">
        <h2>KB Group</h2>
        <ModalTrigger title="Add kbgroup" trigger={triggerKbGroup}>
          <KbGroup />
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
