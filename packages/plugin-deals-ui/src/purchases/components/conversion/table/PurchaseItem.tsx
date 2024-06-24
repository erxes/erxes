import { renderAmount } from '@erxes/ui-cards/src/boards/utils';
import Tip from '@erxes/ui/src/components/Tip';
import { getUserAvatar } from '@erxes/ui/src/utils';
import { IPurchase } from '@erxes/ui-cards/src/purchases/types';
import * as React from 'react';
import { BodyRow } from '../style';

type Props = {
  purchase: IPurchase;
};

export default class PurchaseItem extends React.PureComponent<Props> {
  render() {
    const { purchase } = this.props;
    const stageName = purchase.stage ? purchase.stage.name : '';

    return (
      <BodyRow>
        <span>{purchase.name}</span>
        <span>{renderAmount(purchase.amount) || 0}</span>
        <span>{stageName}</span>
        <span>
          {(purchase.assignedUsers || []).map(user => (
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
