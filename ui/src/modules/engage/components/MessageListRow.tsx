import dayjs from 'dayjs';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { __, Alert } from 'modules/common/utils';
import {
  MESSAGE_KIND_FILTERS,
  MESSAGE_KINDS,
  METHODS
} from 'modules/engage/constants';
import { ISegment } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import { Capitalize } from 'modules/settings/permissions/styles';
import React from 'react';
import s from 'underscore.string';
import { Disabled, HelperText, RowTitle } from '../styles';
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
  copy: () => void;

  isChecked: boolean;
  toggleBulk: (value: IEngageMessage, isChecked: boolean) => void;
};

class Row extends React.Component<Props> {
  renderLink(text: string, iconName: string, onClick, disabled?: boolean) {
    const button = <Button btnStyle="link" onClick={onClick} icon={iconName} />;

    return (
      <Tip
        text={__(text)}
        key={`${text}-${this.props.message._id}`}
        placement="top"
      >
        {disabled ? <Disabled>{button}</Disabled> : button}
      </Tip>
    );
  }

  onEdit = () => {
    const msg = this.props.message;

    if (
      msg.isLive &&
      (msg.kind === MESSAGE_KINDS.AUTO ||
        msg.kind === MESSAGE_KINDS.VISITOR_AUTO)
    ) {
      return Alert.info('Pause the Campaign first and try editing');
    }

    if (msg.isLive && msg.kind === MESSAGE_KINDS.MANUAL) {
      return Alert.warning(
        'Unfortunately once a campaign has been sent, it cannot be stopped or edited.'
      );
    }

    return this.props.edit();
  };

  renderLinks() {
    const msg = this.props.message;

    const pause = this.renderLink('Pause', 'pause-circle', this.props.setPause);
    const live = this.renderLink('Set live', 'play-circle', this.props.setLive);
    const liveM = this.renderLink(
      'Set live',
      'play-circle',
      this.props.setLiveManual
    );
    const show = this.renderLink('Show statistics', 'eye', this.props.show);
    const copy = this.renderLink('Copy', 'copy-1', this.props.copy);
    const editLink = this.renderLink('Edit', 'edit-3', this.onEdit, msg.isLive);

    const links: React.ReactNode[] = [copy, editLink];

    if ([METHODS.EMAIL, METHODS.SMS].includes(msg.method) && !msg.isDraft) {
      links.push(show);
    }

    if (msg.kind === MESSAGE_KINDS.MANUAL) {
      if (msg.isDraft) {
        return [...links, liveM];
      }

      return links;
    }

    if (msg.isLive) {
      return [...links, pause];
    }

    return [...links, live];
  }

  renderRemoveButton = onClick => {
    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  };

  toggleBulk = e => {
    this.props.toggleBulk(this.props.message, e.target.checked);
  };

  renderSegments(message) {
    const segments = message.segments || ([] as ISegment[]);

    return segments.map(segment => (
      <HelperText key={segment._id}>
        <Icon icon="chart-pie" /> {segment.name}
      </HelperText>
    ));
  }

  renderMessengerRules(message) {
    const messenger = message.messenger || ({} as IEngageMessenger);
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <HelperText key={rule._id}>
        <Icon icon="sign-alt" /> {rule.text} {rule.condition} {rule.value}
      </HelperText>
    ));
  }

  renderBrands(message) {
    const brands = message.brands || ([] as IBrand[]);

    return brands.map(brand => (
      <HelperText key={brand._id}>
        <Icon icon="award" /> {brand.name}
      </HelperText>
    ));
  }

  onClick = () => {
    const { message } = this.props;

    if ([METHODS.EMAIL, METHODS.SMS].includes(message.method)) {
      return this.props.show();
    }

    if (message.kind !== MESSAGE_KINDS.MANUAL) {
      return this.props.edit();
    }
  };

  renderStatus() {
    const { message } = this.props;
    const { kind, scheduleDate, isLive, runCount, isDraft } = message;
    let labelStyle = 'primary';
    let labelText = 'Sending';

    if (!isLive && isDraft) {
      labelStyle = 'simple';
      labelText = 'Paused';
    }
    if (isLive && !isDraft) {
      labelStyle = 'primary';
      labelText = 'Sending';
    }

    if (kind === MESSAGE_KINDS.MANUAL) {
      if (runCount > 0) {
        labelStyle = 'success';
        labelText = 'Sent';
      }
    }

    // scheduled auto campaign
    if (scheduleDate && kind === MESSAGE_KINDS.AUTO) {
      const scheduledDate = new Date(scheduleDate.dateTime);
      const now = new Date();

      if (
        scheduleDate.type === 'pre' &&
        scheduledDate.getTime() > now.getTime()
      ) {
        labelStyle = 'warning';
        labelText = 'Scheduled';
      }
      if (scheduleDate.type === 'sent') {
        labelStyle = 'success';
        labelText = 'Sent';
      }
    }

    return <Label lblStyle={labelStyle}>{labelText}</Label>;
  }

  renderType(msg) {
    let icon: string = 'multiply';
    let label: string = 'Other type';

    switch (msg.method) {
      case METHODS.EMAIL:
        icon = 'envelope';
        label = __('Email');

        break;
      case METHODS.SMS:
        icon = 'comment-alt-message';
        label = __('Sms');

        break;
      case METHODS.MESSENGER:
        icon = 'comment-1';
        label = __('Messenger');

        break;
      default:
        break;
    }

    const kind = MESSAGE_KIND_FILTERS.find(item => item.name === msg.kind);
    return (
      <div>
        <Icon icon={icon} /> {label}
        <HelperText>
          <Icon icon="clipboard-notes" /> {kind && kind.text} Campaign
        </HelperText>
      </div>
    );
  }

  render() {
    const { isChecked, message, remove } = this.props;
    const {
      brand = { name: '' },
      scheduleDate,
      totalCustomersCount = 0,
      segmentIds = [],
      brandIds = [],
      customerTagIds = []
    } = message;

    // segment or brand or tagIds can determine target count if total is 0
    const targetCount =
      totalCustomersCount ||
      segmentIds.length ||
      brandIds.length ||
      customerTagIds.length;

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
          <RowTitle onClick={this.onClick}>
            {message.title}{' '}
            {message.isDraft && <Label lblStyle="simple">Draft</Label>}
          </RowTitle>
          {this.renderBrands(message)}
          {this.renderSegments(message)}
          {this.renderMessengerRules(message)}
        </td>
        <td>{this.renderStatus()}</td>
        <td className="text-primary">
          <Icon icon="cube-2" />
          <b> {s.numberFormat(targetCount)}</b>
        </td>
        <td>{this.renderType(message)}</td>
        <td>
          <strong>{brand ? brand.name : '-'}</strong>
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={30} />
        </td>

        <td className="text-normal">
          <Capitalize>{message.createdUser || '-'}</Capitalize>
        </td>
        <td>
          <Icon icon="calender" />{' '}
          {dayjs(message.createdAt).format('DD MMM YYYY')}
        </td>

        <td>
          <Icon icon="clock-eight" />{' '}
          {scheduleDate && scheduleDate.dateTime
            ? dayjs(scheduleDate.dateTime).format('DD MMM YYYY HH:mm')
            : '-- --- ---- --:--'}
        </td>

        <td>
          <Tags tags={message.customerTags || []} />
        </td>

        <td>
          <ActionButtons>
            {this.renderLinks()}
            {this.renderRemoveButton(remove)}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
