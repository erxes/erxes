import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Icon } from 'modules/common/components';
import { DealFooter, DealDate, DealAmount } from '../../styles';
import { ItemCounter, UserCounter } from '../';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class Deal extends React.Component {
  renderDate(closeDate) {
    if (!closeDate) return null;

    return (
      <DealDate>
        <Icon icon="android-time" /> {moment(closeDate).format('YYYY-MM-DD')}
      </DealDate>
    );
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
        <ItemCounter items={products} />
        <ItemCounter color="#F7CE53" items={deal.companies || []} />
        <ItemCounter color="#3CCC38" items={deal.customers || []} />

        <DealFooter>
          {this.renderAmount(deal.amount || {})}
          {this.renderDate(deal.closeDate)}

          <UserCounter users={deal.assignedUsers || []} />
        </DealFooter>
      </div>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
