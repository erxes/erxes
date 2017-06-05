import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Tip, ActionButtons } from '/imports/react-ui/common';
import Sidebar from './Sidebar';

const propTypes = {
  type: PropTypes.string,
  messages: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
};

class List extends React.Component {
  renderEditLink(message) {
    // show only if auto
    if (this.props.type !== 'auto') {
      return null;
    }

    const editUrl = FlowRouter.path(`/engage/messages/edit/${message._id}`);

    return (
      <Tip text="Edit">
        <Button bsStyle="link" href={editUrl}>
          <i className="ion-edit" />
        </Button>
      </Tip>
    );
  }

  renderRows(message) {
    const remove = this.props.remove;

    const removeAction = () => {
      remove(message._id);
    };

    return (
      <tr key={message._id}>
        <td>{message.title}</td>
        <td>{message.segment().name}</td>
        <td>{message.fromUser().username}</td>
        <td>{moment(message.createdDate).format('DD MMM YYYY')}</td>

        <td className="text-right">
          <ActionButtons>
            {this.renderEditLink(message)}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={removeAction}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { type, messages } = this.props;

    const actionBarLeft = (
      <Button bsStyle="link">
        <a href={`/engage/messages/create?type=${type || ''}`}>
          <i className="ion-plus-circled" />
          New {type === 'auto' ? 'auto' : 'manual'} message
        </a>
      </Button>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Segment</th>
            <th>From</th>
            <th>Created date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(message => this.renderRows(message))}
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
}

List.propTypes = propTypes;

export default List;
