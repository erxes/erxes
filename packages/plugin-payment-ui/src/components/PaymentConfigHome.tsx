import React from 'react';
import { IPaymentTypeCount } from 'types';

import { Title } from '@erxes/ui-settings/src/styles';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';

import { PAYMENTCONFIGS } from './constants/paymentConfigs';
import PaymentConfigRow from './PaymentConfigRow';
import {
  Content,
  FullHeight,
  PaymentConfigWrapper,
  SearchInput
} from './styles';

type Props = {
  queryParams: any;
  paymentConfigsCount: IPaymentTypeCount;
};

type State = {
  searchValue: string;
  paymentConfigs: any;
};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      paymentConfigs: PAYMENTCONFIGS.filter(
        paymentConfig => paymentConfig.category.indexOf('Payment method') !== -1
      )
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue } = this.state;
    const { queryParams } = this.props;

    if (
      prevProps.queryParams.type !== queryParams.type ||
      prevState.searchValue !== searchValue
    ) {
      this.setState({
        paymentConfigs: PAYMENTCONFIGS.filter(
          paymentConfig =>
            paymentConfig.name.toLowerCase().indexOf(searchValue) !== -1 &&
            paymentConfig.category.indexOf(
              queryParams.type || 'Payment method'
            ) !== -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderPaymentConfigs() {
    const { paymentConfigs, searchValue } = this.state;
    const { paymentConfigsCount, queryParams } = this.props;
    const datas = [] as any;
    const rows = [...paymentConfigs];

    while (rows.length > 0) {
      datas.push(
        <PaymentConfigRow
          key={rows.length}
          paymentConfigs={rows.splice(0, 4)}
          paymentConfigsCount={paymentConfigsCount}
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
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Payments') },
      { title: `${this.props.queryParams.type || __('All payments')}` }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="Paymets"
        description={`${__('Set up your payment method')}.${__(
          'Now you can choose payment method'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Payments')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{queryParams.type || 'All Payments'}</Title>}
            right={this.renderSearch()}
            withMargin={true}
            wide={true}
            background="colorWhite"
          />
        }
        mainHead={headerDescription}
        content={
          <Content>
            <PaymentConfigWrapper>
              {this.renderPaymentConfigs()}
            </PaymentConfigWrapper>
          </Content>
        }
        hasBorder={true}
        transparent={true}
        noPadding={true}
      />
    );
  }
}

export default Home;
