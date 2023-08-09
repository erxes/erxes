import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../../containers/category/Form';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { __ } from 'coreui/utils';
import { DURATION_TYPES, JOB_TYPE_CHOISES } from '../../../constants';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IJobCategory, IJobRefer } from '../../types';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';
import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';
import { TableOver } from '../../../styles';
import { IProduct } from '@erxes/ui-products/src/types';
import { IProductsData } from '../../../types';

type Props = {
  jobRefer?: IJobRefer;
  jobCategories: IJobCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  jobType: string;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  categoryId: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const productRefer = props.jobRefer || ({} as IJobRefer);
    const { needProducts, resultProducts } = productRefer;

    this.state = {
      jobType: productRefer.type || 'job',
      needProducts: needProducts || [],
      resultProducts: resultProducts || [],
      categoryId: ''
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsData[];
    resultProducts: IProductsData[];
  }) => {
    const { jobRefer } = this.props;
    const finalValues = values;
    const { needProducts, resultProducts, jobType } = this.state;

    if (jobRefer) {
      finalValues._id = jobRefer._id;
    }

    if (jobType === 'income') {
      return {
        ...finalValues,
        needProducts: [],
        resultProducts
      };
    }

    if (jobType === 'outlet') {
      return {
        ...finalValues,
        needProducts,
        resultProducts: []
      };
    }

    if (jobType === 'move') {
      return {
        ...finalValues,
        needProducts,
        resultProducts: needProducts
      };
    }

    if (jobType === 'end') {
      return {
        ...finalValues,
        needProducts,
        resultProducts:
          resultProducts.length > 1 ? [resultProducts[0]] : resultProducts
      };
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
          product[formType] = Number(value);
        } else {
          product.uom = value;
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

  renderProductServiceTrigger() {
    let content = (
      <div>
        {__('Choose Product & service ')} <Icon icon="plus-circle" />
      </div>
    );

    return <ProductButton>{content}</ProductButton>;
  }

  renderProductModal = (type: 'needProducts' | 'resultProducts') => {
    const productOnChange = (products: IProduct[]) => {
      const currentProducts = this.state[type];
      const currentProductIds = currentProducts.map(p => p.productId);
      const chosenProductIds = products.map(p => p._id);

      for (const product of products.filter(
        p => !currentProductIds.includes(p._id)
      ) || []) {
        const productId = product ? product._id : '';
        const uom = product.uom || '';

        const inputData = {
          _id: Math.random().toString(),
          productId,
          quantity: 1,
          uom,
          product
        };

        currentProducts.push(inputData);
      }

      const chosenProducts =
        currentProducts.filter(p => chosenProductIds.includes(p.productId)) ||
        [];
      this.setState({ [type]: chosenProducts } as any);
    };

    const currentProducts =
      type === 'needProducts'
        ? this.state.needProducts
        : this.state.resultProducts;

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
        data={{
          name: 'Product',
          products: (currentProducts || [])
            .filter(p => p.product)
            .map(p => p.product)
        }}
        limit={
          this.state.jobType === 'end' && type === 'resultProducts' ? 1 : 50
        }
      />
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger()}
        size="lg"
        content={content}
      />
    );
  };

  renderProducts = (type: 'needProducts' | 'resultProducts') => {
    const products =
      type === 'needProducts'
        ? this.state.needProducts
        : this.state.resultProducts;

    const { jobType } = this.state;

    products.sort();

    return (
      <withTableWrapper.Wrapper>
        <TableOver
          whiteSpace="nowrap"
          hover={true}
          bordered={true}
          responsive={true}
          wideHeader={true}
        >
          <thead>
            <tr>
              <th>{__('Product')}</th>
              <th>{__('Quantity')}</th>
              <th>{__('UOM')}</th>
              {type === 'resultProducts' &&
                jobType === 'job' &&
                products.length > 1 && <th>{__('Proportion')}</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const uoms = Array.from(
                new Set([
                  product.uom,
                  product.product.uom,
                  ...product.product.subUoms.map(su => su.uom)
                ])
              ).filter(u => u);

              return (
                <tr>
                  <td>
                    <FormControl
                      value={
                        product && product.product ? product.product.name : ''
                      }
                      disabled={true}
                    />
                  </td>
                  <td>
                    <FormControl
                      value={product ? product.quantity : 0}
                      align="right"
                      type="number"
                      onChange={this.onChange.bind(
                        this,
                        product._id,
                        type,
                        'quantity'
                      )}
                    />
                  </td>
                  <td>
                    <FormControl
                      componentClass="select"
                      value={product.uom}
                      onChange={this.onChange.bind(
                        this,
                        product._id,
                        type,
                        'uom'
                      )}
                    >
                      {uoms.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </FormControl>
                  </td>
                  {type === 'resultProducts' &&
                    jobType === 'job' &&
                    products.length > 1 && (
                      <td>
                        <FormControl
                          value={product ? product.proportion : 0}
                          align="right"
                          type="number"
                          onChange={this.onChange.bind(
                            this,
                            product._id,
                            type,
                            'proportion'
                          )}
                        />
                      </td>
                    )}
                  <td>
                    <ActionButtons>
                      <Tip text="Delete" placement="top">
                        <Button
                          btnStyle="link"
                          onClick={this.onClickRemoveButton.bind(
                            this,
                            product._id,
                            type
                          )}
                          icon="times-circle"
                        />
                      </Tip>
                    </ActionButtons>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableOver>
      </withTableWrapper.Wrapper>
    );
  };

  renderProductsGroup = () => {
    const { jobType } = this.state;

    if (jobType === 'income') {
      return (
        <FormGroup>
          <ControlLabel required={true}>Result products:</ControlLabel>
          {this.renderProductModal('resultProducts')}
          {this.renderProducts('resultProducts')}
        </FormGroup>
      );
    }

    if (jobType === 'outlet') {
      return (
        <FormGroup>
          <ControlLabel required={true}>Need products:</ControlLabel>
          {this.renderProductModal('needProducts')}
          {this.renderProducts('needProducts')}
        </FormGroup>
      );
    }

    if (jobType === 'move') {
      return (
        <FormGroup>
          <ControlLabel required={true}>Move products:</ControlLabel>
          {this.renderProductModal('needProducts')}
          {this.renderProducts('needProducts')}
        </FormGroup>
      );
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Need products:</ControlLabel>
          {this.renderProductModal('needProducts')}
          {this.renderProducts('needProducts')}
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Result products:</ControlLabel>
          {this.renderProductModal('resultProducts')}
          {this.renderProducts('resultProducts')}
        </FormGroup>
      </>
    );
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

    const { name, code, type, duration, durationType, categoryId } = object;

    return (
      <>
        <FormWrapper>
          <FormColumn>
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
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <FormControl
                {...formProps}
                name="code"
                defaultValue={code}
                required={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
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
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <FormControl
                {...formProps}
                name="type"
                componentClass="select"
                defaultValue={type}
                required={true}
                onChange={e =>
                  this.setState({
                    jobType: (e.currentTarget as HTMLInputElement).value
                  })
                }
              >
                {Object.keys(JOB_TYPE_CHOISES).map(value => (
                  <option key={value} value={value}>
                    {JOB_TYPE_CHOISES[value]}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
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
          </FormColumn>

          <FormColumn>
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
          </FormColumn>
        </FormWrapper>

        {this.renderProductsGroup()}

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
