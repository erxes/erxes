import { Tip } from 'modules/common/components';
import { __, getUserAvatar } from 'modules/common/utils';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as React from 'react';
import { BodyRow } from '../style';

type Props = {
  deal: IDeal;
};

export default class DealItem extends React.PureComponent<Props> {
  render() {
    const { deal } = this.props;
    const stage = deal.stage;

    return (
      <BodyRow>
        <span>{deal.name}</span>
        <span>{renderDealAmount(deal.amount) || 0}</span>
        <span>{(stage && stage.name) || ''}</span>
        <span>
          {(deal.assignedUsers || []).map(user => (
            <Tip
              key={user._id}
              text={user.details && (user.details.fullName || user.email)}
            >
              <img
                src={getUserAvatar(user)}
                width="22px"
                height="22px"
                style={{ marginLeft: '2px', borderRadius: '11px' }}
              />
            </Tip>
          ))}
        </span>
      </BodyRow>
    );
  }
}
