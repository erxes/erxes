import dayjs from 'dayjs';
import Label from '@erxes/ui/src/components/Label';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import { Link } from 'react-router-dom';
import { ISmsDelivery } from '../types';

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
    const status: any = {};

    return (
      <td>
        <Label lblColor={status ? status.color : ''}>
          {this.getValue(log.status)}
        </Label>
      </td>
    );
  }

  renderCampaignLink(campaignId?: string) {
    if (!campaignId) {
      return <td>-</td>;
    }

    return (
      <td>
        <Link to={`/campaigns/show/${campaignId}`} target="_blank">
          Go to campaign
        </Link>
      </td>
    );
  }

  renderDirection(delivery: ISmsDelivery) {
    const { direction, engageMessageId } = delivery;

    if (direction && !engageMessageId) {
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

    if (engageMessageId) {
      return (
        <td>
          <TextInfo textStyle="simple">{DIRECTIONS.OUTBOUND}</TextInfo>
        </td>
      );
    }

    return <td>-</td>;
  }

  getValue(val?: string) {
    return val || '-';
  }

  render() {
    const { log } = this.props;

    if (!log) {
      return null;
    }

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        {this.renderDirection(log)}
        <td>{this.getValue(log.to)}</td>
        {this.renderStatus()}
        {this.renderCampaignLink(log.engageMessageId)}
        <td>{this.getValue(log.from)}</td>
        <td>{this.getValue(log.content)}</td>
        <td>
          {log.errorMessages && log.errorMessages.length > 0
            ? log.errorMessages
            : '-'}
        </td>
      </tr>
    );
  }
} // end class
