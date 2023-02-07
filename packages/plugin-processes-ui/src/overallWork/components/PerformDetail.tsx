import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IUom } from '@erxes/ui-products/src/types';

type Props = {
  allUoms: IUom[];
  stateName: 'inProducts' | 'outProducts';
  productData: any;
  productsData: any[];
  hasCost?: boolean;
  onChangeState: (value: any) => void;
};

type State = {
  amount: number;
  quantity: number;
};

class PerformDetail extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    const { productData } = this.props;

    this.state = {
      amount: productData.amount || 0,
      quantity: productData.quantity || 0
    };
  }

  onChange = e => {
    const { onChangeState, stateName, productsData, productData } = this.props;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const inputVal = e.target.value;
    const inputName = e.target.name;

    this.timer = setTimeout(() => {
      const newProductsData = productsData.map(pd =>
        pd.productId === productData.productId
          ? { ...pd, [inputName]: inputVal }
          : pd
      );

      onChangeState({
        [stateName]: newProductsData
      } as any);
    }, 500);
  };

  render() {
    const { productData, hasCost, allUoms } = this.props;
    const { product } = productData;
    const productName = product
      ? `${product.code} - ${product.name}`
      : 'not name';

    const beUomIds = [product.uomId, ...product.subUoms.map(su => su.uomId)];

    return (
      <tr>
        <td>{__(productName)}</td>
        <td>
          <FormControl
            defaultValue={productData.uomId}
            componentClass="select"
            name="uomId"
            options={[
              ...allUoms
                .filter(au => (beUomIds || []).includes(au._id))
                .map(u => ({
                  value: u._id,
                  label: `${u.code} - ${u.name}`
                }))
            ]}
            required={true}
            onChange={this.onChange}
          />
        </td>
        <td>
          <FormControl
            defaultValue={productData.quantity}
            type="number"
            name="quantity"
            required={true}
            onChange={this.onChange}
          />
        </td>
        {hasCost && (
          <td>
            <FormControl
              defaultValue={productData.amount || 0}
              type="number"
              name="amount"
              required={true}
              onChange={this.onChange}
            />
          </td>
        )}
      </tr>
    );
  }
}

export default PerformDetail;
