import React from 'react';
import { Wrapper } from 'modules/layout/components';
import { ModalTrigger, Button, Icon } from 'modules/common/components';
import Sidebar from '../../Sidebar';
import { Messenger, Form, Facebook } from '../containers';

function AddIntegration() {
  const triggerMessenger = (
    <Button>
      <Icon icon="chatbubbles" /> Add messenger
    </Button>
  );

  const triggerForm = (
    <Button>
      <Icon icon="formbubbles" /> Add form
    </Button>
  );

  const triggerFb = (
    <Button>
      <Icon icon="social-facebook" /> Add facebook page
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
          <Icon icon="social-twitter" /> Add twitter
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
