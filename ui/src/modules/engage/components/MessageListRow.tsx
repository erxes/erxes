import dayjs from 'dayjs';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { MESSAGE_KINDS } from 'modules/engage/constants';
import React from 'react';
import { HelperText, RowTitle } from '../styles';
import { IEngageMessage, IEngageMessenger } from '../types';

type Props = {
  message: any;

  // TODO: add types
  edit: () => void;
  show: () => void;
  remove: () => void;
  setLive: () => void;
  setLiveManual: () => void;
  setPause: () => void;

  isChecked: boolean;
  toggleBulk: (value: IEngageMessage, isChecked: boolean) => void;
};

class Row extends React.Component<Props> {
  renderLink(text, className, onClick) {
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
    const live = this.renderLink('Set live', 'play', this.props.setLive);
    const liveM = this.renderLink('Set live', 'play', this.props.setLiveManual);
    const show = this.renderLink('Show statistics', 'eye', this.props.show);

    const links: React.ReactNode[] = [];

    if (msg.method === 'email') {
      links.push(show);
    }

    if (msg.kind === MESSAGE_KINDS.MANUAL) {
      if (msg.isDraft) {
        return [...links, liveM];
      }

      return links;
    }

    if (msg.isDraft) {
      return [...links, edit, live];
    }

    if (msg.isLive) {
      return [...links, edit, pause];
    }

    return [...links, edit, live];
  }

  renderRemoveButton = (message, onClick) => {
    if (!message.kind.toLowerCase().includes('auto')) {
      return null;
    }

    return (
      <Tip text={__('Delete')}>
        <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
      </Tip>
    );
  };

  toggleBulk = e => {
    this.props.toggleBulk(this.props.message, e.target.checked);
  };

  renderRules() {
    const { message } = this.props;

    if (message.segment) {
      return (
        <HelperText>
          <Icon icon="chart-pie-alt" /> {message.segment.name}
        </HelperText>
      );
    }

    const messenger = message.messenger || ({} as IEngageMessenger);
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <HelperText key={rule._id}>
        <Icon icon="chart-pie-alt" /> {rule.text} {rule.condition} {rule.value}
      </HelperText>
    ));
  }

  onClick = () => {
    const { message } = this.props;

    if (message.method === 'email') {
      return this.props.show();
    }

    return this.props.edit();
  };

  render() {
    let status = <Label lblStyle="default">Sending</Label>;

    const { isChecked, message, remove } = this.props;
    const { stats = { send: '' }, brand = { name: '' } } = message;

    const totalCount = stats.total || 0;

    if (totalCount === stats.send) {
      status = <Label lblStyle="success">Sent</Label>;
    }

    return (
      <tr key={message._id}>
        <td>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={this.toggleBulk}
          />
        </td>
        <td>
          <RowTitle onClick={this.onClick}>{message.title}</RowTitle>
          {message.isDraft ? <Label lblStyle="primary">Draft</Label> : null}
          {this.renderRules()}
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={30} />
        </td>
        <td>{status}</td>
        <td className="text-primary">
          <Icon icon="cube-2" />
          <b> {totalCount}</b>
        </td>
        <td>
          {message.email ? (
            <div>
              <Icon icon="envelope" /> {__('Email')}
            </div>
          ) : (
            <div>
              <Icon icon="comment-1" /> {__('Messenger')}
            </div>
          )}
        </td>

        <td>
          <b>{brand ? brand.name : '-'}</b>
        </td>

        <td>
          <Icon icon="calender" />{' '}
          {dayjs(message.createdAt).format('DD MMM YYYY')}
        </td>

        <td>
          <Tags tags={message.getTags} limit={1} />
        </td>

        <td>
          <ActionButtons>
            {this.renderLinks()}
            {this.renderRemoveButton(message, remove)}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
