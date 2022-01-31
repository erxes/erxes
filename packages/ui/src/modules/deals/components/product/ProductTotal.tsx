import { FormControl } from 'modules/common/components/form';
import {
  Amount,
  ContentColumn,
  ContentRow,
  Measure
} from 'modules/deals/styles';
import { IProductData } from 'modules/deals/types';
import React from 'react';

type Props = {
  kindTxt: string;
  totalKind: { value: string; percent?: number };
  currency: string;
  productsData: IProductData[];
  updateTotal: () => void;
  onChangeProductsData: (productsData: IProductData[]) => void;
};

type State = {};

class ProductTotal extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount = () => {
    this.props.updateTotal();
  };

  taxAmountLogic = (amount, pData) => {
    if (amount > 0) {
      pData.tax = ((amount - pData.discount) * pData.taxPercent) / 100;
      pData.amount = amount - (pData.discount || 0) + (pData.tax || 0);
    } else {
      pData.amount = 0;
      pData.discount = 0;
      pData.tax = 0;
    }
  };

  onChangePercent = e => {
    const value = Number((e.target as HTMLInputElement).value);
    const {
      productsData,
      kindTxt,
      onChangeProductsData,
      updateTotal,
      currency
    } = this.props;

    for (const pData of productsData.filter(
      item => item.currency === currency
    )) {
      const amount = pData.unitPrice * pData.quantity;
      switch (kindTxt) {
        case 'discount': {
          pData.discountPercent = value;
          pData.discount = (amount * value) / 100;
          break;
        }
        case 'tax': {
          pData.taxPercent = value;
          break;
        }
      }
      this.taxAmountLogic(amount, pData);
    }

    onChangeProductsData(productsData);
    updateTotal();
  };

  onChange = e => {
    // only total discount has editable
    const value = Number((e.target as HTMLInputElement).value);
    const {
      productsData,
      onChangeProductsData,
      updateTotal,
      currency
    } = this.props;

    const currencyProData = productsData.filter(
      item => item.currency === currency
    );
    const sumAmount = currencyProData.reduce(
      (sum, cur) => sum + cur.unitPrice * cur.quantity,
      0
    );
    const tmpPercent = (value * 100) / sumAmount;

    for (const pData of currencyProData) {
      const amount = pData.unitPrice * pData.quantity;
      pData.discount = (amount / sumAmount) * value;
      pData.discountPercent = tmpPercent;
      this.taxAmountLogic(amount, pData);
    }

    onChangeProductsData(productsData);
    updateTotal();
  };

  renderTotalPercent() {
    const { totalKind, kindTxt } = this.props;

    if (kindTxt === 'total') {
      return;
    }

    return (
      <ContentRow>
        <FormControl
          value={parseFloat((totalKind.percent || 0).toFixed(3))}
          type="number"
          min={0}
          max={100}
          placeholder="0"
          name={kindTxt}
          onChange={this.onChangePercent}
        />
        <Measure>%</Measure>
      </ContentRow>
    );
  }

  renderTotalDiscount() {
    const { currency, kindTxt, totalKind } = this.props;

    if (kindTxt !== 'discount') {
      return;
    }

    return (
      <ContentRow>
        <FormControl
          value={totalKind.value ? parseFloat(totalKind.value).toFixed(3) : 0}
          type="number"
          placeholder="0"
          name={kindTxt}
          onChange={this.onChange}
        />
        <Measure>{currency}</Measure>
      </ContentRow>
    );
  }

  renderTax() {
    const { currency, kindTxt, totalKind } = this.props;

    if (kindTxt !== 'tax') {
      return;
    }

    return (
      <Amount>
        {(totalKind.value || 0).toLocaleString()} <b>{currency}</b>
      </Amount>
    );
  }

  renderTotal() {
    const { currency, kindTxt, totalKind } = this.props;

    if (kindTxt !== 'total') {
      return;
    }

    return (
      <Amount>
        {totalKind.toLocaleString()} <b>{currency}</b>
      </Amount>
    );
  }

  render() {
    return (
      <ContentRow>
        <ContentColumn>{this.renderTotalPercent()}</ContentColumn>
        <ContentColumn flex="2">
          {this.renderTotalDiscount()}
          {this.renderTax()}
          {this.renderTotal()}
        </ContentColumn>
      </ContentRow>
    );
  }
}

export default ProductTotal;
