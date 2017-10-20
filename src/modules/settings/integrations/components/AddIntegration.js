import React from 'react';
import { Button } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { ModalTrigger } from 'modules/common/components';
import Sidebar from '../../Sidebar';
import { Messenger, Form } from '../containers';

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
        <h2>Social integrations</h2>

        <Button href="/settings/integrations/twitter">
          <i className="ion-social-twitter" /> Add twitter
        </Button>
      </div>
    </div>
  );

  const breadcrumb = [
    { title: 'Settings', link: '/settings/channels' },
    { title: 'Integrations', link: '/settings/integrations' },
    { title: 'Add Integrations' }
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
