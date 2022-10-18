import { Title } from '@erxes/ui-settings/src/styles';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { getSubMenu } from '../containers/utils';

import { ByKindTotalCount } from '../types';
import { PAYMENTCONFIGS } from './constants';
import PaymentRow from './PaymentRow';
import { Content, FullHeight, PaymentWrapper, SearchInput } from './styles';

type Props = {
  queryParams: any;
  totalCount: ByKindTotalCount;
};

type State = {
  searchValue: string;
  payments: any;
};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      payments: PAYMENTCONFIGS.filter(
        payment => payment.category.indexOf('Payment method') !== -1
      )
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue } = this.state;
    const { queryParams } = this.props;

    if (
      prevProps.queryParams.kind !== queryParams.kind ||
      prevState.searchValue !== searchValue
    ) {
      this.setState({
        payments: PAYMENTCONFIGS.filter(
          payment =>
            payment.name.toLowerCase().indexOf(searchValue) !== -1 &&
            payment.category.indexOf(queryParams.kind || 'Payment method') !==
              -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderPayments() {
    const { payments, searchValue } = this.state;
    const { totalCount, queryParams } = this.props;
    const datas = [] as any;
    const rows = [...payments];

    while (rows.length > 0) {
      datas.push(
        <PaymentRow
          key={rows.length}
          payments={rows.splice(0, 4)}
          paymentsCount={totalCount}
          queryParams={queryParams}
        />
      );
    }

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for1 "${searchValue}"`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return datas;
  }

  renderSearch() {
    return (
      <SearchInput isInPopover={false}>
        <Icon icon="search-1" />
        <FormControl
          type="text"
          placeholder={__('Type to search for an payments') + '...'}
          onChange={this.onSearch}
        />
      </SearchInput>
    );
  }

  render() {
    const { queryParams } = this.props;

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Payments')} submenu={getSubMenu()} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{queryParams.kind || 'All Payments'}</Title>}
            right={this.renderSearch()}
            background="colorWhite"
          />
        }
        content={
          <Content>
            <PaymentWrapper>{this.renderPayments()}</PaymentWrapper>
          </Content>
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default Home;
