import { ProductButton } from '@erxes/ui-cards/src/deals/styles';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { IProduct } from '@erxes/ui-products/src/types';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { DrawerDetail } from '../../../../styles';
import { IJob } from '../../../../types';
import Common from '../Common';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  products: IProduct[];
  flowJobs: IJob[];
  lastFlowJob?: IJob;
  flowProduct?: IProduct;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  setUsedPopup: (check: boolean) => void;
};

type State = {
  productId: string;
  product?: IProduct;
  description: string;
  name: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
  currentTab: string;
  categoryId: string;
};

class JobForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { products, activeFlowJob } = props;
    const { config, description } = activeFlowJob;

    const product = products.length && products[0];

    const {
      productId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = config;

    this.state = {
      productId: productId || '',
      product,
      description: description || '',
      name: products.length ? products[0].name : '' || '',
      inBranchId: inBranchId || '',
      inDepartmentId: inDepartmentId || '',
      outBranchId: outBranchId || '',
      outDepartmentId: outDepartmentId || '',
      currentTab: 'inputs',

      categoryId: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({
        productId: nextProps.activeFlowJob.productId,
        description: nextProps.activeFlowJob.description
      });
    }
  }

  renderProductServiceTrigger(product?: IProduct) {
    const onClick = () => {
      this.props.setUsedPopup(true);
    };

    let content = (
      <div onClick={onClick}>
        {__('Choose Product & Service')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div onClick={onClick}>
          {product.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderContent() {
    const { product } = this.state;

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const productOnChange = prs => {
      let pr: any = {};
      if (!prs.length) {
        this.setState({ productId: '', product: undefined });
        return;
      }

      pr = prs[0];
      this.setState({ productId: pr._id, product: pr });
    };

    const { description } = this.state;

    const content = props => {
      const onCloseModal = () => {
        this.props.setUsedPopup(false);
        props.closeModal();
      };

      return (
        <ProductChooser
          {...props}
          closeModal={onCloseModal}
          onSelect={productOnChange}
          onChangeCategory={categoryId => this.setState({ categoryId })}
          categoryId={this.state.categoryId}
          data={{
            name: 'Product',
            products: product ? [product] : []
          }}
          limit={1}
        />
      );
    };

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Income Product</ControlLabel>
          <ModalTrigger
            title="Choose product & service"
            trigger={this.renderProductServiceTrigger(product)}
            size="lg"
            content={content}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            name="description"
            value={description}
            onChange={onChangeValue.bind(this, 'description')}
          />
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    const {
      productId,
      product,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <Common
        {...this.props}
        name={(product && product.name) || 'Unknown'}
        description={description}
        config={{
          productId,
          inBranchId,
          inDepartmentId,
          outBranchId,
          outDepartmentId
        }}
        {...this.props}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
