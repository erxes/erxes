import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IUom } from '@erxes/ui-products/src/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import SelectSeries from './../containers/SelectSeries';

type Props = {
  allUoms: IUom[];
  stateName: 'inProducts' | 'outProducts';
  productData: any;
  productsData: any[];
  hasCost?: boolean;
  isReadSeries?: boolean;
  onChangeState: (value: any) => void;
};

type State = {};

class PerformDetail extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);
    this.state = {};
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

  onChangeInput = e => {
    const { stateName, onChangeState, productData, productsData } = this.props;
    const newProductsData = productsData.map(pd =>
      pd.productId === productData.productId
        ? { ...pd, series: [...(productData.series || []), e.target.value] }
        : pd
    );
    onChangeState({
      [stateName]: newProductsData
    } as any);
  };

  renderSeriesReader() {
    const { isReadSeries } = this.props;
    if (!isReadSeries) {
      return <></>;
    }

    const onChangeSeries = series => {
      const {
        stateName,
        onChangeState,
        productData,
        productsData
      } = this.props;
      const newProductsData = productsData.map(pd =>
        pd.productId === productData.productId ? { ...pd, series } : pd
      );
      onChangeState({
        [stateName]: newProductsData
      } as any);
    };

    const trigger = (
      <Button btnStyle="link">
        <Icon icon="focus-target" />
      </Button>
    );

    const modalContent = ({ closeModal }) => {
      const { productData } = this.props;
      return (
        <>
          <SelectSeries
            label={'kiosk'}
            name="kioskExcludeProductIds"
            initialValue={productData.series}
            filterParams={{ productId: productData.productId }}
            onSelect={onChangeSeries}
            multi={true}
          />
          <ModalFooter>
            <Button
              btnStyle="simple"
              onClick={closeModal}
              icon="times-circle"
              uppercase={false}
            >
              Close
            </Button>
          </ModalFooter>
        </>
      );
    };

    return (
      <ModalTrigger
        title={__('Insert series number')}
        size="sm"
        trigger={trigger}
        autoOpenKey="showSeriesReaderModal"
        content={modalContent}
      />
    );
  }

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
        <td>
          <ActionButtons>{this.renderSeriesReader()}</ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PerformDetail;
