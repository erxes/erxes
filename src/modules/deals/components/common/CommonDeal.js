import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DealProduct, DealDate, DealAmount } from '../../styles';
import { ItemCounter, UserCounter } from '../';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class Deal extends React.Component {
  renderProducts(products) {
    return <ItemCounter items={products} />;
  }

  renderUsers(users) {
    return <UserCounter users={users} />;
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

    return (
      <div>
        <DealDate>{moment(deal.closeDate).format('YYYY-MM-DD')}</DealDate>

        <DealProduct>
          {this.renderProducts(deal.products.map(p => p.product))}
        </DealProduct>

        {this.renderAmount(deal.amount || {})}

        {this.renderUsers(deal.assignedUsers || [])}
      </div>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
