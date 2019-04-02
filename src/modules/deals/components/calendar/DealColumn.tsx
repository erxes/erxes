import { EmptyState, Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { AddNew } from 'modules/deals/styles/stage';
import * as React from 'react';
import styled from 'styled-components';
import { IDeal, IDealTotalAmount } from '../../types';
import { Deal } from '../portable';

type Props = {
  deals: IDeal[];
  date: IDateColumn;
  dealTotalAmounts: IDealTotalAmount;
  onUpdate: (deal: IDeal) => void;
  onRemove: () => void;
  onLoadMore: (skip: number) => void;
};

const Container = styled.div`
  position: relative;
  height: 100%;
`;

const ContentBody = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 0 4px;
  margin: 0 4px;
  padding-bottom: 100px;
  overflow-y: auto;
`;

const Footer = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 37px;
  left: 0;
  right: 0;
  text-align: center;
  border-top: 1px solid ${colors.borderPrimary};
  background: ${colors.bgLight};
`;

const Amount = styled.ul`
  list-style: none;
  overflow: hidden;
  margin: 0 0 5px;
  padding: 0 16px;

  li {
    padding-right: 5px;
    font-size: 12px;

    span {
      font-weight: bold;
      font-size: 10px;
    }

    &:after {
      content: '/';
      margin-left: 5px;
    }

    &:last-child:after {
      content: '';
    }
  }
`;

class DealColumn extends React.Component<Props, {}> {
  onLoadMore = () => {
    const { deals, onLoadMore } = this.props;
    onLoadMore(deals.length);
  };

  renderContent() {
    const { deals, onUpdate, onRemove } = this.props;

    if (deals.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    const contents = deals.map((deal: IDeal, index: number) => (
      <Deal key={index} deal={deal} onRemove={onRemove} onUpdate={onUpdate} />
    ));

    return <ContentBody>{contents}</ContentBody>;
  }

  renderTotalAmount() {
    const { dealTotalAmounts } = this.props;
    const totals = dealTotalAmounts.dealAmounts || [];

    const content = totals.map(deal => (
      <li key={deal._id}>
        {deal.amount.toLocaleString()} <span>{deal.currency}</span>
      </li>
    ));

    return <Amount>{content}</Amount>;
  }

  renderFooter() {
    const { deals, dealTotalAmounts } = this.props;
    const count = dealTotalAmounts.dealCount;

    if (deals.length === count || deals.length > count) {
      return null;
    }

    return (
      <Footer>
        <AddNew onClick={this.onLoadMore}>
          <Icon icon="refresh" /> {__('Load more')}
        </AddNew>
      </Footer>
    );
  }

  render() {
    return (
      <Container>
        {this.renderTotalAmount()}
        {this.renderContent()}
        {this.renderFooter()}
      </Container>
    );
  }
}

export default DealColumn;
