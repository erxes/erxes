import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Sidebar } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';
import {
  DealSectionContainer,
  DealContainer,
  DealProduct,
  DealDate,
  DealAmount
} from '../../styles';
import { ItemCounter, UserCounter } from '../';

const propTypes = {
  deals: PropTypes.array.isRequired
};

class DealSection extends React.Component {
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
    const { Section } = Sidebar;
    const { Title } = Sidebar.Section;
    const { deals } = this.props;
    const { __ } = this.context;

    return (
      <Section>
        <Title>{__('Deals')}</Title>

        <DealSectionContainer>
          {deals.map((deal, index) => (
            <DealContainer key={index}>
              <DealDate>{moment(deal.closeDate).format('YYYY-MM-DD')}</DealDate>

              <DealProduct>
                {this.renderProducts(deal.products.map(p => p.product))}
              </DealProduct>

              {this.renderAmount(deal.amount || {})}

              {this.renderUsers(deal.assignedUsers || [])}
            </DealContainer>
          ))}

          {deals.length === 0 && <EmptyState icon="briefcase" text="No deal" />}
        </DealSectionContainer>
      </Section>
    );
  }
}

DealSection.propTypes = propTypes;
DealSection.contextTypes = {
  __: PropTypes.func
};

export default DealSection;
