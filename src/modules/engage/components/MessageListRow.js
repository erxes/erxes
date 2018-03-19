import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import {
  Tip,
  ActionButtons,
  NameCard,
  FormControl,
  Button,
  Label,
  Icon,
  Tags
} from 'modules/common/components';
import { HelperText, EngageTitle } from '../styles';
import { MESSAGE_KINDS } from 'modules/engage/constants';

const propTypes = {
  columnsConfig: PropTypes.array.isRequired,
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
    const { __ } = this.context;
    return (
      <Tip text={__(text)} key={`${text}-${this.props.message._id}`}>
        <Button btnStyle="link" onClick={onClick} icon={className} />
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

  renderValue(name, counter) {
    const { message } = this.props;
    const { __ } = this.context;

    let status = <Label lblStyle="default">Sending</Label>;
    let successCount = 0;
    let failedCount = 0;

    if (name === 'title') {
      return (
        <td key={counter}>
          <EngageTitle onClick={this.props.edit}>{message.title}</EngageTitle>
          {message.isDraft ? <Label lblStyle="primary">Draft</Label> : null}
          {this.renderRules()}
        </td>
      );
    }
    if (name === 'from') {
      return (
        <td className="text-normal" key={counter}>
          <NameCard user={message.fromUser} avatarSize={30} singleLine />
        </td>
      );
    } else if (name === 'status') {
      return <td key={counter}>{status}</td>;
    } else if (name === 'total') {
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
        <td className="text-primary" key={counter}>
          <Icon icon="cube" />
          <b> {totalCount}</b>
        </td>
      );
    } else if (name === 'sent') {
      return (
        <td className="text-success" key={counter}>
          <Icon icon="paper-airplane" />
          <b> {successCount}</b>
        </td>
      );
    } else if (name === 'failed') {
      return (
        <td className="text-warning" key={counter}>
          <Icon icon="alert-circled" />
          <b> {failedCount}</b>
        </td>
      );
    } else if (name === 'type') {
      return (
        <td key={counter}>
          {message.email ? (
            <div>
              <Icon icon="email" /> {__('Email')}
            </div>
          ) : (
            <div>
              <Icon icon="chatbox" /> {__('Messenger')}
            </div>
          )}
        </td>
      );
    } else if (name === 'created date') {
      return (
        <td key={counter}>
          <Icon icon="calendar" />{' '}
          {moment(message.createdDate).format('DD MMM YYYY')}
        </td>
      );
    } else if (name === 'tags') {
      return (
        <td key={counter}>
          <Tags tags={message.getTags} limit={3} />
        </td>
      );
    } else if (name === 'brand') {
      return (
        <td key={counter}>{message.getBrand ? message.getBrand.name : ''}</td>
      );
    }

    return <td key={counter}>{_.get(message, name)}</td>;
  }

  render() {
    const { message, columnsConfig, remove } = this.props;
    const { __ } = this.context;

    let counter = 0;
    return (
      <tr key={message._id}>
        <td>
          <FormControl componentClass="checkbox" onChange={this.toggleBulk} />
        </td>
        {columnsConfig.map(({ name }) => this.renderValue(name, counter++))}
        <td>
          <ActionButtons>
            {this.renderLinks()}

            <Tip text={__('Delete')}>
              <Button btnStyle="link" onClick={remove} icon="close" />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
