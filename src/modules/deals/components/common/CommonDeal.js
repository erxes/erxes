import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Tip } from 'modules/common/components';
import { UserCounter, Items } from '../';
import {
  DealDate,
  SpaceContent,
  ItemList,
  FooterContent
} from '../../styles/deal';
import { Amount } from '../../styles/stage';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class Deal extends React.Component {
  renderDate(closeDate) {
    if (!closeDate) return null;

    return (
      <Tip text={moment(closeDate).format('YYYY-MM-DD')}>
        <DealDate>{moment(closeDate).fromNow()}</DealDate>
      </Tip>
    );
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <Amount>
        {Object.keys(amount).map(key => (
          <li key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </li>
        ))}
      </Amount>
    );
  }

  render() {
    const { deal } = this.props;
    const products = deal.products.map(p => p.product);

    return (
      <Fragment>
        <SpaceContent>
          <h4>{deal.name}</h4>
          {this.renderDate(deal.closeDate)}
        </SpaceContent>

        <SpaceContent>
          <FooterContent>
            <ItemList>
              <Items items={products} />
            </ItemList>
            <ItemList>
              <Items items={deal.customers || []} />
              <Items uppercase items={deal.companies || []} />
            </ItemList>
            {this.renderAmount(deal.amount || {})}
          </FooterContent>
          <UserCounter users={deal.assignedUsers || []} />
        </SpaceContent>
      </Fragment>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
