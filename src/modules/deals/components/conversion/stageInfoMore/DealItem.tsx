import { __, getUserAvatar } from 'modules/common/utils';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import { Body } from '../style';

import * as React from 'react';

type Props = {
  deal: IDeal;
};

export default class DealItem extends React.PureComponent<Props> {
  render() {
    const { deal } = this.props;

    return (
      <Body>
        <span>{deal.name}</span>

        <span>{renderDealAmount(deal.amount) || 0}</span>
        <span>{renderDealAmount(deal.amount)}</span>
        <span>
          {(deal.assignedUsers || []).map((user, index) => (
            <img
              key={index}
              src={getUserAvatar(user)}
              width="22px"
              height="22px"
              style={{ marginLeft: '2px', borderRadius: '11px' }}
            />
          ))}
        </span>
      </Body>
    );
  }
}
