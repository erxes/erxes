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
  setLive: PropTypes.func.isRequired,
  setLiveManual: PropTypes.func.isRequired,
  setPause: PropTypes.func.isRequired,
};

class List extends React.Component {
  renderLink(msg, text, className, onClick) {
    return (
      <Tip text={text} key={`${text}-${msg._id}`}>
        <Button bsStyle="link" onClick={onClick}>
          <i className={className} />
        </Button>
      </Tip>
    );
  }

  rowEdit(message) {
    FlowRouter.go(`/engage/messages/edit/${message._id}`);
  }

  rowPause(message) {
    this.props.setPause(message._id);
  }

  rowLive(message) {
    this.props.setLive(message._id);
  }

  rowLiveManual(message) {
    this.props.setLiveManual(message._id);
  }

  renderLinks(msg) {
    const edit = this.renderLink(msg, 'Edit', 'ion-edit', this.rowEdit.bind(this, msg));
    const pause = this.renderLink(msg, 'Pause', 'ion-gear-a', this.rowPause.bind(this, msg));
    const live = this.renderLink(
      msg,
      'Set live',
      'ion-paper-airplane',
      this.rowLive.bind(this, msg),
    );

    if (msg.isAuto) {
      if (msg.isDraft) {
        return [edit, live];
      }

      if (msg.isLive) {
        return [edit, pause];
      }

      return [edit, live];
    }

    if (msg.isDraft) {
      return this.renderLink('Set live', 'ion-paper-airplane', this.rowLiveManual.bind(this, msg));
    }
  }

  renderRows(message) {
    const remove = this.props.remove;

    const removeAction = () => {
      remove(message._id);
    };

    let status = 'sending';
    let successCount = 0;
    let failedCount = 0;

    const deliveryReports = Object.values(message.deliveryReports);
    const totalCount = deliveryReports.length;

    deliveryReports.forEach(report => {
      if (report.status === 'sent') {
        successCount++;
      }

      if (report.status === 'failed') {
        failedCount++;
      }
    });

    if (totalCount === successCount + failedCount) {
      status = 'sent';
    }

    return (
      <tr key={message._id}>
        <td>{message.title}</td>
        <td>{message.segment().name}</td>
        <td>{message.fromUser().username}</td>
        <td>{status}</td>
        <td>{totalCount}</td>
        <td>{successCount}</td>
        <td>{failedCount}</td>
        <td>{moment(message.createdDate).format('DD MMM YYYY')}</td>

        <td className="text-right">
          <ActionButtons>
            {this.renderLinks(message)}

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

  renderNewButton() {
    const type = this.props.type;

    if (type) {
      const text = `New ${type === 'auto' ? 'auto' : 'manual'} message`;

      return (
        <Button bsStyle="link" href={`/engage/messages/create?type=${type || ''}`}>
          <i className="ion-plus-circled" /> {text}
        </Button>
      );
    }
  }

  render() {
    const { messages } = this.props;

    const actionBarLeft = this.renderNewButton();

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Table className="no-wrap">
        <thead>
          <tr>
            <th>Title</th>
            <th>Segment</th>
            <th>From</th>
            <th>Status</th>
            <th>Total</th>
            <th>Sent</th>
            <th>Failed</th>
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
