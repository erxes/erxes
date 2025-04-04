import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import SelectSeries from "./../containers/SelectSeries";
import { __ } from "coreui/utils";

type Props = {
  stateName: "inProducts" | "outProducts";
  productData: any;
  productsData: any[];
  hasCost?: boolean;
  isReadSeries?: boolean;
  onChangeState: (value: any) => void;
  onEnter: (val?: number) => void;
  deleteDetail: (stateName, productsData, removeId) => void;
};

type State = {};

class PerformDetail extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);
    this.state = {};
  }

  onChange = (e) => {
    const { onChangeState, stateName, productsData, productData } = this.props;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const inputVal = e.target.value;
    const inputName = e.target.name;

    this.timer = setTimeout(() => {
      const newProductsData = productsData.map((pd) =>
        pd.productId === productData.productId
          ? { ...pd, [inputName]: inputVal }
          : pd
      );

      onChangeState({
        [stateName]: newProductsData,
      } as any);
    }, 5);
  };

  onChangeInput = (e) => {
    const { stateName, onChangeState, productData, productsData } = this.props;
    const newProductsData = productsData.map((pd) =>
      pd.productId === productData.productId
        ? { ...pd, series: [...(productData.series || []), e.target.value] }
        : pd
    );
    onChangeState({
      [stateName]: newProductsData,
    } as any);
  };

  renderSeriesReader() {
    const { isReadSeries } = this.props;
    if (!isReadSeries) {
      return <></>;
    }

    const onChangeSeries = (series) => {
      const { stateName, onChangeState, productData, productsData } =
        this.props;
      const newProductsData = productsData.map((pd) =>
        pd.productId === productData.productId ? { ...pd, series } : pd
      );
      onChangeState({
        [stateName]: newProductsData,
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
            label={"Series"}
            name="seriesReader"
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
        title={__("Insert series number")}
        size="sm"
        trigger={trigger}
        autoOpenKey="showSeriesReaderModal"
        content={modalContent}
      />
    );
  }

  onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        this.props.onEnter(-1);
        return;
      }
      this.props.onEnter();
    }
  };

  onDelete = () => {
    const { deleteDetail, stateName, productsData, productData } = this.props
    deleteDetail(stateName, productsData, productData._id)
  }

  render() {
    const { productData, hasCost } = this.props;
    const { product = {} } = productData;
    const productName = product
      ? `${product.code} - ${product.name}`
      : "not name";

    const uoms = Array.from(
      new Set([
        productData.uom,
        product.uom,
        ...(product.subUoms || []).map((su) => su.uom),
      ])
    )
      .filter((u) => u)
      .map((u) => ({ value: u, label: u }));

    return (
      <tr>
        <td>{__(productName)}</td>
        <td>
          <FormControl
            value={productData.uom}
            componentclass="select"
            name="uom"
            options={uoms}
            required={true}
            onChange={this.onChange}
          />
        </td>
        <td>
          <div className="canFocus">
            <FormControl
              value={productData.quantity}
              type="number"
              name="quantity"
              required={true}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onFocus={(e) => (e.target as any).select()}
            />
          </div>
        </td>
        {hasCost && (
          <td>
            <FormControl
              value={productData.amount || 0}
              type="number"
              name="amount"
              required={true}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
            />
          </td>
        )}
        <td>
          <ActionButtons>
            <Button btnStyle="link" onClick={this.onDelete}>
              <Icon icon="trash-alt" />
            </Button>
            {this.renderSeriesReader()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PerformDetail;
