import { FormControl } from 'modules/common/components/form';
import { ContentColumn, ContentRow, Measure } from 'modules/deals/styles';
import { IProductData } from 'modules/deals/types';
import React from 'react';

type Props = {
  kindTxt: string;
  totalKind: object;
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

  sameCode = (amount, pData) => {
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
      this.sameCode(amount, pData);
    }

    onChangeProductsData(productsData);
    updateTotal();
  };

  onChange = e => {
    const value = Number((e.target as HTMLInputElement).value);
    const {
      productsData,
      kindTxt,
      onChangeProductsData,
      updateTotal,
      currency
    } = this.props;
    if (kindTxt !== 'discount') {
      return;
    }

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
      this.sameCode(amount, pData);
    }

    onChangeProductsData(productsData);
    updateTotal();
  };

  renderTotalPercent(value, kindTxt) {
    if (kindTxt === 'totalPercent') {
      return;
    }

    return (
      <ContentColumn>
        <ContentRow>
          <FormControl
            value={value.percent}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name={kindTxt}
            onChange={this.onChangePercent}
          />
          <Measure>%</Measure>
        </ContentRow>
      </ContentColumn>
    );
  }

  render() {
    const { currency, kindTxt, totalKind } = this.props;
    return (
      <div key={currency}>
        <ContentRow>
          {this.renderTotalPercent(
            totalKind[currency],
            kindTxt.concat('Percent')
          )}
          <ContentColumn flex="2">
            <ContentRow>
              <FormControl
                value={totalKind[currency].value}
                type="number"
                placeholder="0"
                name={kindTxt}
                disabled={kindTxt === 'discount' ? false : true}
                onChange={this.onChange}
              />
              <Measure>{currency}</Measure>
            </ContentRow>
          </ContentColumn>
        </ContentRow>
      </div>
    );
  }
}

export default ProductTotal;
