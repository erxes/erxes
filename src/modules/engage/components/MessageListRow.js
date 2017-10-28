import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Label } from 'react-bootstrap';
import { Tip, ActionButtons, NameCard } from 'modules/common/components';
import { MESSAGE_KINDS } from 'modules/engage/constants';

const propTypes = {
  message: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  setLive: PropTypes.func.isRequired,
  setLiveManual: PropTypes.func.isRequired,
  setPause: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired
};

class Row extends React.Component {
  constructor(props) {
    super(props);

    this.toggleBulk = this.toggleBulk.bind(this);
  }

  renderLink(text, className, onClick) {
    return (
      <Tip text={text} key={`${text}-${this.props.message._id}`}>
        <Button bsStyle="link" onClick={onClick}>
          <i className={className} />
        </Button>
      </Tip>
    );
  }

  renderLinks() {
    const msg = this.props.message;
    const edit = this.renderLink('Edit', 'ion-edit', this.props.edit);
    const pause = this.renderLink('Pause', 'ion-pause', this.props.setPause);
    const live = this.renderLink(
      'Set live',
      'ion-paper-airplane',
      this.props.setLive
    );

    if (msg.kind !== MESSAGE_KINDS.MANUAL) {
      if (msg.isDraft) {
        return [edit, live];
      }

      if (msg.isLive) {
        return [edit, pause];
      }

      return [edit, live];
    }

    if (msg.isDraft) {
      return this.renderLink(
        'Set live',
        'ion-paper-airplane',
        this.props.setLiveManual
      );
    }
  }

  toggleBulk(e) {
    this.props.toggleBulk(this.props.message, e.target.checked);
  }

  renderRules() {
    const { message } = this.props;

    if (message.segment) {
      return (
        <div className="engage-rule">
          <i className="ion-pie-graph" /> {message.segment.name}
        </div>
      );
    }
    const messenger = message.messenger || {};
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <div key={rule._id} className="engage-rule">
        <i className="ion-pie-graph" /> {rule.text} {rule.condition}{' '}
        {rule.value}
      </div>
    ));
  }

  render() {
    let status = <Label bsStyle="info">Sending</Label>;
    let successCount = 0;
    let failedCount = 0;

    const { message, remove } = this.props;

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
      status = <Label bsStyle="success">Sent</Label>;
    }

    return (
      <tr key={message._id}>
        <td className="less-space">
          <input type="checkbox" onChange={this.toggleBulk} />
        </td>
        <td>
          <b>{message.title}</b>{' '}
          {message.isDraft ? <Label bsStyle="primary">Draft</Label> : null}
          {this.renderRules()}
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={32} singleLine />
        </td>
        <td>{status}</td>
        <td className="cell-icon text-primary">
          <i className="ion-cube" />
          <b> {totalCount}</b>
        </td>
        <td className="cell-icon text-success">
          <i className="ion-checkmark-circled" />
          <b> {successCount}</b>
        </td>
        <td className="cell-icon text-warning">
          <i className="ion-alert-circled" />
          <b> {failedCount}</b>
        </td>

        <td>
          {message.email ? (
            <div>
              <i className="ion-email" /> Email
            </div>
          ) : (
            <div>
              <i className="ion-chatbox" /> Messenger
            </div>
          )}
        </td>
        <td>
          <i className="ion-calendar" />{' '}
          {moment(message.createdDate).format('DD MMM YYYY')}
        </td>

        <td className="text-right">
          <ActionButtons>
            {this.renderLinks()}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={remove}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
