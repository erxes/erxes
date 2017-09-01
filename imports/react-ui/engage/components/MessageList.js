import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { TaggerPopover } from '/imports/react-ui/common';
import { MessageListRow } from '../containers';
import Sidebar from './Sidebar';

const propTypes = {
  messages: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
};

class List extends React.Component {
  renderTagger() {
    const { bulk, emptyBulk } = this.props;

    if (bulk.length) {
      const targets = bulk.map(b => b._id);

      return (
        <TaggerPopover
          type="engageMessage"
          targets={targets}
          trigger={
            <Button bsStyle="link">
              <i className="ion-pricetags" /> Tag <span className="caret" />
            </Button>
          }
          afterSave={emptyBulk}
        />
      );
    }
  }

  render() {
    const { messages, tags } = this.props;

    const actionBarLeft = (
      <div>
        <Button bsStyle="link" href={'/engage/messages/create?kind=auto'}>
          <i className="ion-plus-circled" /> New auto message
        </Button>

        <Button bsStyle="link" href={'/engage/messages/create?kind=visitorAuto'}>
          <i className="ion-plus-circled" /> New visitor auto message
        </Button>

        <Button bsStyle="link" href={'/engage/messages/create?kind=manual'}>
          <i className="ion-plus-circled" /> New manual message
        </Button>
        {this.renderTagger()}
      </div>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Table className="no-wrap">
        <thead>
          <tr>
            <th />
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
          {messages.map(message => (
            <MessageListRow
              toggleBulk={this.props.toggleBulk}
              key={message._id}
              message={message}
            />
          ))}
        </tbody>
      </Table>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Engage' }]} />}
          leftSidebar={<Sidebar tags={tags} />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

List.propTypes = propTypes;

export default List;
