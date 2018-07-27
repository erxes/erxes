import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import T from 'i18n-react';

import { Tip } from 'modules/common/components';
import { UserCounter, Items } from '../';
import {
  DealDate,
  SpaceContent,
  ItemList,
  FooterContent,
  ActionInfo
} from '../../styles/deal';

import { Amount } from '../../styles/stage';

const propTypes = {
  deal: PropTypes.object.isRequired
};

class CommonDeal extends React.Component {
  renderDate(date, format = 'YYYY-MM-DD') {
    if (!date) return null;

    return (
      <Tip text={moment(date).format(format)}>
        <DealDate>{moment(date).fromNow()}</DealDate>
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
    const products = (deal.products || []).map(p => p.product);

    return (
      <Fragment>
        <SpaceContent>
          <h4>{deal.name}</h4>
          {this.renderDate(deal.closeDate)}
        </SpaceContent>
        <SpaceContent>
          <FooterContent>
            <ItemList>
              <Items color="#63D2D6" items={products} />
            </ItemList>
            <ItemList>
              <Items color="#F7CE53" items={deal.customers || []} />
              <Items color="#F7CE53" uppercase items={deal.companies || []} />
            </ItemList>
            {this.renderAmount(deal.amount || {})}
          </FooterContent>
          <UserCounter users={deal.assignedUsers || []} />
        </SpaceContent>
        <ActionInfo>
          <span>{T.translate('Last updated')}:</span>
          {this.renderDate(deal.modifiedAt, 'lll')}
        </ActionInfo>
      </Fragment>
    );
  }
}

CommonDeal.propTypes = propTypes;

export default CommonDeal;
