import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Tip, ActionButtons } from '/imports/react-ui/common';
import Sidebar from './Sidebar';

const propTypes = {
  messages: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
};

function List({ messages, remove }) {
  const actionBarLeft = (
    <Button bsStyle="link">
      <a href="/engage/messages/create">
        <i className="ion-plus-circled" />
        New Message
      </a>
    </Button>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

  const renderRows = message => {
    const editUrl = FlowRouter.path(`/engage/messages/edit/${message._id}`);

    const removeAction = () => {
      remove(message._id);
    };

    return (
      <tr key={message._id}>
        <td>{message.title}</td>
        <td>{message.fromUser().username}</td>
        <td>{moment(message.createdDate).format('DD MMM YYYY')}</td>

        <td className="text-right">
          <ActionButtons>
            <Tip text="Edit">
              <Button bsStyle="link" href={editUrl}>
                <i className="ion-edit" />
              </Button>
            </Tip>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={removeAction}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>Title</th>
          <th>From</th>
          <th>Created date</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {messages.map(message => renderRows(message))}
      </tbody>
    </Table>
  );

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Messages' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
