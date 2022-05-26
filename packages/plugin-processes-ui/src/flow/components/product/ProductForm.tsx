import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import {
  ModalFooter,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { JOB_TYPE_CHOISES, DURATION_TYPES } from '../../../constants';
import CategoryForm from '../../containers/productCategory/CategoryForm';
import { Row } from '@erxes/ui-settings/src/integrations/styles';
import {
  IJobRefer,
  IJobCategory,
  IUom,
  IConfigsMap,
  IProductsDataDocument,
  IProduct
} from '../../types';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';
import { __ } from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  jobRefer?: IJobRefer;
  jobCategories: IJobCategory[];
  uoms?: IUom[];
  configsMap?: IConfigsMap;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  needProducts: IProductsDataDocument[];
  resultProducts: IProductsDataDocument[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const productRefer = props.productRefer || ({} as IJobRefer);
    const { needProducts, resultProducts } = productRefer;

    this.state = {
      needProducts: needProducts ? needProducts : [],
      resultProducts: resultProducts ? resultProducts : []
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsDataDocument[];
    resultProducts: IProductsDataDocument[];
  }) => {
    const { jobRefer } = this.props;
    const finalValues = values;
    const { needProducts, resultProducts } = this.state;

    if (jobRefer) {
      finalValues._id = jobRefer._id;
    }

    return {
      ...finalValues,
      needProducts,
      resultProducts
    };
  };

  renderFormTrigger(trigger: React.ReactNode) {
    const content = props => (
      <CategoryForm {...props} categories={this.props.jobCategories} />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  }

  renderProductServiceTrigger(product?: IProduct) {
    let content = (
      <div>
        {__('Choose Product & service ')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div>
          {product.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderProductModal = (currentProduct?: IProduct, type = '') => {
    const productOnChange = (products: IProduct[]) => {
      const { uoms, configsMap } = this.props;
      const defaultUom = configsMap.default_uom || '';
      // const selectedProducts = products && products.length === 1 ? products[0] : products;

      for (const product of products) {
        const productId = product ? product._id : '';
        const uomId = product.uomId ? product.uomId : defaultUom;
        const uom = uoms.find(e => e._id === uomId);

        const inputData = {
          _id: Math.random().toString(),
          productId,
          quantity: 1,
          uomId,
          branchId: '',
          departmentId: '',
          product,
          uom
        };

        const currentProducts = this.state[type];

        currentProducts.push(inputData);

        this.setState({ [type]: currentProducts });
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        // onChangeCategory={this.onChangeCategory}
        categoryId=""
        data={{
          name: 'Product',
          products: currentProduct ? [currentProduct] : []
        }}
        limit={10}
      />
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger(currentProduct)}
        size="lg"
        content={content}
      />
    );
  };

  renderProducts = type => {
    const products =
      type === 'need' ? this.state.needProducts : this.state.resultProducts;
    return products.map(product => (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormControl
                defaultValue={product.product.name}
                disabled={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <FormControl
                defaultValue={product.uom.name + ' /Uom/'}
                disabled={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Row>
                <FormControl defaultValue={product.quantity + ' /Qty/'} />
                <Button btnStyle="simple" uppercase={false} icon="cancel-1" />
              </Row>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </>
    ));
  };

  renderContent = (formProps: IFormProps) => {
    const {
      renderButton,
      closeModal,
      jobRefer,
      jobCategories,
      configsMap
    } = this.props;
    const { values, isSubmitted } = formProps;
    const object = jobRefer || ({} as IJobRefer);

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            componentClass="select"
            defaultValue={object.type}
            required={true}
          >
            {Object.keys(JOB_TYPE_CHOISES).map((typeName, index) => (
              <option key={index} value={typeName}>
                {typeName}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Category</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="categoryId"
              componentClass="select"
              defaultValue={object.categoryId}
              required={true}
            >
              <option value="" />
              {jobCategories.map(categoryMap => (
                <option key={categoryMap._id} value={categoryMap._id}>
                  {categoryMap.name}
                </option>
              ))}
            </FormControl>

            {this.renderFormTrigger(trigger)}
          </Row>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Duration Type</ControlLabel>
          <FormControl
            {...formProps}
            name="durationType"
            componentClass="select"
            defaultValue={object.type}
            required={true}
          >
            {Object.keys(DURATION_TYPES).map((typeName, index) => (
              <option key={index} value={typeName}>
                {typeName}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Duration</ControlLabel>
          <FormControl
            {...formProps}
            name="duration"
            defaultValue={object.code}
            required={true}
            type="number"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Need products</ControlLabel>
          {this.renderProductModal(null, 'needProducts')}
        </FormGroup>

        {this.renderProducts('need')}

        <FormGroup>
          <ControlLabel required={true}>Result products</ControlLabel>
          {this.renderProductModal(null, 'resultProducts')}
        </FormGroup>

        {this.renderProducts('result')}

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
            name: 'Job',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: jobRefer
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
