import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DealItemCounter, DealDate, DealAmount } from '../../styles';
import { ItemCounter, UserCounter } from '../';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class Deal extends React.Component {
  renderDate(closeDate) {
    if (!closeDate) return null;

    return <DealDate>{moment(closeDate).format('YYYY-MM-DD')}</DealDate>;
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <DealAmount>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </p>
        ))}
      </DealAmount>
    );
  }

  render() {
    const { deal } = this.props;
    const products = deal.products.map(p => p.product);

    return (
      <div>
        {this.renderDate(deal.closeDate)}

        <DealItemCounter>
          <ItemCounter items={deal.companies || []} />
        </DealItemCounter>

        <DealItemCounter>
          <ItemCounter items={deal.customers || []} />
        </DealItemCounter>

        <DealItemCounter>
          <ItemCounter items={products} />
        </DealItemCounter>

        {this.renderAmount(deal.amount || {})}

        <UserCounter users={deal.assignedUsers || []} />
      </div>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
