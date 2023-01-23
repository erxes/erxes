import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { FieldStyle, SidebarCounter } from '@erxes/ui/src/layout/styles';

type Props = {
  stateName: 'inProducts' | 'outProducts';
  productData: any;
  productsData: any[];
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

  onChangePerView = e => {
    const { onChangeState, stateName, productsData } = this.props;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const inputVal = e.target.value;
    const inputName = e.target.name;

    this.timer = setTimeout(() => {
      const productData = productsData.map(pd =>
        pd.productId === productData.productId
          ? { ...pd, [inputName]: inputVal }
          : pd
      );

      onChangeState({
        [stateName]: productData
      } as any);
    }, 500);
  };

  render() {
    const { productData } = this.props;
    const { uom, product } = productData;
    const productName = product ? product.name : 'not name';
    const uomCode = uom ? uom.code : 'not uom';

    return (
      <li key={Math.random()}>
        <FieldStyle>
          {__(productName)} /${uomCode}/
        </FieldStyle>
        <SidebarCounter>
          <FormControl
            defaultValue={productData.quantity}
            type="number"
            name="quantity"
            required={true}
            onChange={this.onChangePerView}
          />
        </SidebarCounter>
      </li>
    );
  }
}

export default PerformDetail;
