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
  categoryId: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    console.log('contsructor: ', props.jobRefer);

    const productRefer = props.jobRefer || ({} as IJobRefer);
    const { needProducts, resultProducts } = productRefer;

    this.state = {
      needProducts: needProducts ? needProducts : [],
      resultProducts: resultProducts ? resultProducts : [],
      categoryId: ''
    };

    console.log('constructor end');
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

  onClickRemoveButton = (id, type) => {
    const products = this.state[type];
    const filteredUoms = products.filter(product => product._id !== id);
    console.log('remove product', id, type, products, filteredUoms);

    this.setState({ [type]: filteredUoms } as any);
  };

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  onChange = (id, type, formType, e) => {
    const value = e.target.value;
    const products = this.state[type];

    const productEdited: any = [];
    for (const product of products) {
      if (product._id === id) {
        if (formType !== 'uom') {
          product.quantity = Number(value);
        } else {
          product.uomId = value;
        }
      }

      productEdited.push(product);
    }

    this.setState({ [type]: productEdited } as any);
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
      const defaultUom = (configsMap || {}).default_uom || '';
      // const selectedProducts = products && products.length === 1 ? products[0] : products;

      for (const product of products) {
        const productId = product ? product._id : '';
        const uomId = product.uomId ? product.uomId : defaultUom;
        const uom = (uoms || []).find(e => e._id === uomId);

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

        this.setState({ [type]: currentProducts } as any);
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
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
      type === 'needProducts'
        ? this.state.needProducts
        : this.state.resultProducts;

    const { uoms, configsMap } = this.props;

    products.sort();

    return products.map(product => {
      const subUoms = product.product.subUoms ? product.product.subUoms : [];
      const defaultUomId = product.product.uomId
        ? product.product.uomId
        : (configsMap || {}).default_uom;

      const productUoms = subUoms.map(e => e.uomId);
      const mergedUoms = [...productUoms, defaultUomId];

      // const filtered = uoms.filter(u => (mergedUoms.includes(u._id)));

      const filtered: any[] =
        mergedUoms.map(e => {
          const uomOne = (uoms || []).find(u => u._id === e);
          return uomOne;
        }) || [];

      console.log('filtered uoms: ', filtered);
      console.log('product: ', product);
      return (
        <>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <FormControl
                  value={product ? product.product.name : ''}
                  disabled={true}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <Row>
                <FormGroup>
                  <FormControl
                    value={product ? product.quantity : 0}
                    type="number"
                    onChange={this.onChange.bind(
                      this,
                      product._id,
                      type,
                      'quantity'
                    )}
                  />
                </FormGroup>
                {' /Qty/'}
              </Row>
            </FormColumn>
            <FormColumn>
              {/* <FormGroup>
                <Row>
                  <FormControl
                    defaultValue={(uom ? uom.name : '') + ' /Uom/'}
                    disabled={true}
                  />
                </Row>
              </FormGroup> */}

              <FormControl
                componentClass="select"
                value={product.uomId}
                onChange={this.onChange.bind(this, product._id, type, 'uom')}
              >
                <option value="" />
                {(filtered || []).map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </FormControl>
            </FormColumn>

            <FormColumn>
              <Button
                btnStyle="simple"
                uppercase={false}
                icon="cancel-1"
                onClick={this.onClickRemoveButton.bind(this, product._id, type)}
              />
            </FormColumn>
          </FormWrapper>
        </>
      );
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, jobRefer, jobCategories } = this.props;
    const { values, isSubmitted } = formProps;
    const object = jobRefer || ({} as IJobRefer);

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    console.log('start renderContent');

    const { name, code, type, duration, durationType, categoryId } = object;

    console.log(name, code, type, duration, durationType, categoryId);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            componentClass="select"
            defaultValue={type}
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
              defaultValue={categoryId}
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
            defaultValue={durationType}
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
            defaultValue={duration}
            required={true}
            type="number"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Need products</ControlLabel>
          {this.renderProductModal(undefined, 'needProducts')}
        </FormGroup>

        {this.renderProducts('needProducts')}

        <FormGroup>
          <ControlLabel required={true}>Result products</ControlLabel>
          {this.renderProductModal(undefined, 'resultProducts')}
        </FormGroup>

        {this.renderProducts('resultProducts')}

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
