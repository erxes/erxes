import { __, getUserAvatar } from 'modules/common/utils';

import { Deal, PriceContainer, Right } from 'modules/deals/styles/deal';
import { Content, DealIndicator } from 'modules/deals/styles/stage';
import { IDeal } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';

import * as React from 'react';

type Props = {
  deal: IDeal;
};

export default class DealItem extends React.PureComponent<Props> {
  render() {
    const { deal } = this.props;
    const products = (deal.products || []).map(p => p.product);
    const { customers, companies } = deal;

    return (
      <Deal>
        <Content>
          <h5>{deal.name}</h5>

          {products.map((product, index) => (
            <div key={index}>
              <DealIndicator color="#63D2D6" />
              {product.name}
            </div>
          ))}

          {customers.map((customer, index) => (
            <div key={index}>
              <DealIndicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <DealIndicator color="#EA475D" />
              {company.primaryName}
            </div>
          ))}

          <PriceContainer>
            {renderDealAmount(deal.amount)}

            <Right>
              {(deal.assignedUsers || []).map((user, index) => (
                <img
                  key={index}
                  src={getUserAvatar(user)}
                  width="22px"
                  height="22px"
                  style={{ marginLeft: '2px', borderRadius: '11px' }}
                />
              ))}
            </Right>
          </PriceContainer>
        </Content>
      </Deal>
    );
  }
}
