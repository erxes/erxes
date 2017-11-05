import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Tip,
  ActionButtons,
  NameCard,
  FormControl,
  Button,
  Label,
  Icon
} from 'modules/common/components';
import { EngageTitle, HelperText } from '../styles';
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
        <Button btnStyle="link" onClick={onClick}>
          <Icon icon={className} />
        </Button>
      </Tip>
    );
  }

  renderLinks() {
    const msg = this.props.message;
    const edit = this.renderLink('Edit', 'edit', this.props.edit);
    const pause = this.renderLink('Pause', 'pause', this.props.setPause);
    const live = this.renderLink(
      'Set live',
      'paper-airplane',
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
        'paper-airplane',
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
        <HelperText>
          <Icon icon="pie-graph" /> {message.segment.name}
        </HelperText>
      );
    }
    const messenger = message.messenger || {};
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <HelperText key={rule._id}>
        <Icon icon="pie-graph" /> {rule.text} {rule.condition} {rule.value}
      </HelperText>
    ));
  }

  render() {
    let status = <Label lblStyle="default">Sending</Label>;
    let successCount = 0;
    let failedCount = 0;

    const { message, remove } = this.props;

    const deliveryReports = Object.values(message.deliveryReports || {});
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
      status = <Label lblStyle="success">Sent</Label>;
    }

    return (
      <tr key={message._id}>
        <td>
          <FormControl componentClass="checkbox" onChange={this.toggleBulk} />
        </td>
        <td>
          <EngageTitle onClick={this.props.edit}>{message.title}</EngageTitle>
          {message.isDraft ? <Label lblStyle="primary">Draft</Label> : null}
          {this.renderRules()}
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={30} singleLine />
        </td>
        <td>{status}</td>
        <td className="cell-icon text-primary">
          <Icon icon="cube" />
          <b> {totalCount}</b>
        </td>
        <td className="cell-icon text-success">
          <Icon icon="checkmark" />
          <b> {successCount}</b>
        </td>
        <td className="cell-icon text-warning">
          <Icon icon="alert" />
          <b> {failedCount}</b>
        </td>

        <td>
          {message.email ? (
            <div>
              <Icon icon="email" /> Email
            </div>
          ) : (
            <div>
              <Icon icon="chatbox" /> Messenger
            </div>
          )}
        </td>
        <td>
          <Icon icon="calendar" />{' '}
          {moment(message.createdDate).format('DD MMM YYYY')}
        </td>

        <td>
          <ActionButtons>
            {this.renderLinks()}

            <Tip text="Delete">
              <Button btnStyle="link" onClick={remove}>
                <Icon icon="close" />
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
