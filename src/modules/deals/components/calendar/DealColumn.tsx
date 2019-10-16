import { AddNew } from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import options from '../../options';
import { IDeal, IDealTotalAmount } from '../../types';
import Deal from '../DealItem';

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
  padding: 0 4px 90px;
  margin: 0 4px;
  overflow-y: auto;
`;

const Footer = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 31px;
  left: 0;
  right: 0;
  text-align: center;
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
      <Deal
        options={options}
        key={index}
        item={deal}
        onRemove={onRemove}
        onUpdate={onUpdate}
        portable={true}
      />
    ));

    return <ContentBody>{contents}</ContentBody>;
  }

  renderAmount(currencies: [{ name: string; amount: number }]) {
    return currencies.map((total, index) => (
      <>
        {total.amount.toLocaleString()}{' '}
        <span>
          {total.name}
          {index < currencies.length - 1 && ', '}
        </span>
      </>
    ));
  }

  renderTotalAmount() {
    const { dealTotalAmounts } = this.props;
    const totalForType = dealTotalAmounts.totalForType || [];

    return (
      <Amount>
        {totalForType.map(type => (
          <li key={type._id}>
            <span>{type.name}: </span>
            {this.renderAmount(type.currencies)}
          </li>
        ))}
      </Amount>
    );
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
