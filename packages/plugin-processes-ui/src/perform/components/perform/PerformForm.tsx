import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IOverallWorkDocument } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  overallWorkDetail: IOverallWorkDocument;
  max: number;
};

type State = {
  count: number;
  productId: string;
  results: any[];
  isChooseProduct: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { overallWorkDetail } = this.props;
    const { resultProductsDetail } = overallWorkDetail;

    this.state = {
      count: 0,
      productId: '',
      results: (resultProductsDetail || []).map(e => ({
        product: e.product,
        quantity: e.quantity,
        uom: e.uom
      })),
      isChooseProduct: true
    };
  }

  onChange = (name, e) => {
    this.setState({ [name]: e.target.value } as any);
    if (name === 'productId') {
      this.setState({ isChooseProduct: false });
    }
  };

  renderLabel = (max: number) => {
    return max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, max } = this.props;
    const { isSubmitted } = formProps;
    const { results, productId, isChooseProduct } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Result products</ControlLabel>
          <FormControl
            name="type"
            componentClass="select"
            onChange={this.onChange.bind(this, 'productId')}
            required={true}
            value={productId}
          >
            <option value="" />
            {results.map(result => (
              <option key={result.product._id} value={result.product._id}>
                {result.product.name} - {result.quantity}/{result.uom.code}/
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{this.renderLabel(max)}</ControlLabel>
          <FormControl
            disabled={isChooseProduct}
            name="count"
            defaultValue={this.state.count}
            type="number"
            autoFocus={true}
            required={true}
            max={max}
            onChange={this.onChange.bind(this, 'count')}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'Performance',
            values: {
              count: this.state.count,
              productId: this.state.productId
            },
            isSubmitted,
            callback: closeModal,
            object: null
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
