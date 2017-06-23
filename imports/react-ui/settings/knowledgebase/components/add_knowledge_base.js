import React from 'react';
import { Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import { KbGroup } from '../containers';

function AddKnowledgeBase() {
  const triggerKbGroup = (
    <Button>
      Add kb group
    </Button>
  );

  const content = (
    <div className="margined type-box">
      <div className="box">
        <h2>KB Group</h2>

        <ModalTrigger title="Add kbgroup" trigger={triggerKbGroup}>
          <KbGroup />
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

export default AddKnowledgeBase;
