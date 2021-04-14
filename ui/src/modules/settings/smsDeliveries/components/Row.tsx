import dayjs from 'dayjs';
import { SMS_DELIVERY_STATUSES } from 'modules/engage/constants';
import Label from 'modules/common/components/Label';
import React from 'react';
import { Link } from 'react-router-dom';
import { ISmsDelivery } from '../types';
import { SOURCE_TYPES } from './SmsDeliveries';

type Props = {
  log: ISmsDelivery;
  type: string;
};

export default class Row extends React.PureComponent<Props> {
  renderStatus() {
    const { log } = this.props;
    const status = SMS_DELIVERY_STATUSES.OPTIONS.find(
      opt => opt.value === log.status
    );

    return <Label lblColor={status ? status.color : ''}>{log.status}</Label>;
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

    return null;
  }

  render() {
    const { log, type } = this.props;

    if (!log) {
      return null;
    }

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{log.to}</td>
        <td>{this.renderStatus()}</td>
        {this.renderCampaignLink(type, log.engageMessageId)}
        {type === SOURCE_TYPES.INTEGRATION ? (
          <React.Fragment>
            <td>{log.from}</td>
            <td>{log.content}</td>
          </React.Fragment>
        ) : null}
      </tr>
    );
  }
} // end class
