import dayjs from 'dayjs';
import { SMS_DELIVERY_STATUSES } from 'modules/engage/constants';
import Label from 'modules/common/components/Label';
import TextInfo from 'modules/common/components/TextInfo';
import React from 'react';
import { Link } from 'react-router-dom';
import { ISmsDelivery } from '../types';
import { SOURCE_TYPES } from './SmsDeliveries';

type Props = {
  log: ISmsDelivery;
  type: string;
};

const DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound'
};

export default class Row extends React.PureComponent<Props> {
  renderStatus() {
    const { log } = this.props;
    const status = SMS_DELIVERY_STATUSES.OPTIONS.find(
      opt => opt.value === log.status
    );

    return (
      <td>
        <Label lblColor={status ? status.color : ''}>{log.status}</Label>
      </td>
    );
  }

  renderCampaignLink(type: string, campaignId?: string) {
    if (type === SOURCE_TYPES.CAMPAIGN && campaignId) {
      return (
        <td>
          <Link to={`/campaigns/show/${campaignId}`} target="_blank">
            Go to campaign
          </Link>
        </td>
      );
    }

    return <td>-</td>;
  }

  renderDirection(type: string, delivery: ISmsDelivery) {
    const { direction, engageMessageId } = delivery;

    if (type === SOURCE_TYPES.INTEGRATION && direction) {
      return (
        <td>
          <TextInfo
            textStyle={direction === DIRECTIONS.INBOUND ? 'primary' : 'simple'}
          >
            {direction}
          </TextInfo>
        </td>
      );
    }

    if (type === SOURCE_TYPES.CAMPAIGN && engageMessageId) {
      return (
        <td>
          <TextInfo textStyle="simple">{DIRECTIONS.OUTBOUND}</TextInfo>
        </td>
      );
    }

    return <td>-</td>;
  }

  render() {
    const { log, type } = this.props;

    if (!log) {
      return null;
    }

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        {this.renderDirection(type, log)}
        <td>{log.to}</td>
        {this.renderStatus()}
        {this.renderCampaignLink(type, log.engageMessageId)}
        <td>{log.from}</td>
        <td>{log.content}</td>
      </tr>
    );
  }
} // end class
