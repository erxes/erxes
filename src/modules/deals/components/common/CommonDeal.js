import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Icon } from 'modules/common/components';
import { ItemCounter, UserCounter } from '../';
import { Date, Amount, Footer } from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class Deal extends React.Component {
  renderDate(closeDate) {
    if (!closeDate) return null;

    return (
      <Date>
        <Icon icon="android-time" /> {moment(closeDate).format('YYYY-MM-DD')}
      </Date>
    );
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <Amount>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </p>
        ))}
      </Amount>
    );
  }

  render() {
    const { deal } = this.props;
    const products = deal.products.map(p => p.product);

    return (
      <div>
        <h4>{deal.name}</h4>
        <ItemCounter items={products} />
        <ItemCounter color="#F7CE53" items={deal.companies || []} />
        <ItemCounter color="#3CCC38" items={deal.customers || []} />

        <Footer>
          {this.renderAmount(deal.amount || {})}
          {this.renderDate(deal.closeDate)}

          <UserCounter users={deal.assignedUsers || []} />
        </Footer>
      </div>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
