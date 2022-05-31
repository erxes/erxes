import { renderAmount } from '@erxes/ui-cards/src/boards/utils';
import Tip from '@erxes/ui/src/components/Tip';
import { getUserAvatar } from '@erxes/ui/src/utils';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import * as React from 'react';
import { BodyRow } from '../style';

type Props = {
  deal: IDeal;
};

export default class DealItem extends React.PureComponent<Props> {
  render() {
    const { deal } = this.props;
    const stageName = deal.stage ? deal.stage.name : '';

    return (
      <BodyRow>
        <span>{deal.name}</span>
        <span>{renderAmount(deal.amount) || 0}</span>
        <span>{stageName}</span>
        <span>
          {(deal.assignedUsers || []).map(user => (
            <Tip
              key={user._id}
              text={user.details && (user.details.fullName || user.email)}
            >
              <img
                src={getUserAvatar(user)}
                alt={user.details && (user.details.fullName || user.email)}
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
