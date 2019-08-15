import { IUser } from 'modules/auth/types';
import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent, HeaderContentSmall } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
import ProductSection from 'modules/deals/components/ProductSection';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import { IDeal, IDealParams } from '../types';

type Props = {
  options: IOptions;
  item: IDeal;
  users: IUser[];
  addItem: (doc: IDealParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IDealParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  amount: any;
  products: IProduct[];
  productsData: any;
};

export default class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      amount: item.amount || {},
      productsData: item.products ? item.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: item.products ? item.products.map(p => p.product) : []
    };
  }

  renderAmount = () => {
    const { amount } = this.state;

    if (Object.keys(amount).length === 0) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Amount</ControlLabel>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} {key}
          </p>
        ))}
      </HeaderContentSmall>
    );
  };

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderProductSection = () => {
    const { products, productsData } = this.state;

    const pDataChange = pData => this.onChangeField('productsData', pData);
    const prsChange = prs => this.onChangeField('products', prs);

    return (
      <ProductSection
        onChangeProductsData={pDataChange}
        onChangeProducts={prsChange}
        productsData={productsData}
        products={products}
        saveProductsData={this.saveProductsData}
      />
    );
  };

  saveProductsData = () => {
    const { productsData } = this.state;
    const products: IProduct[] = [];
    const amount: any = {};

    const filteredProductsData: any = [];

    productsData.forEach(data => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating item amount
          if (!amount[data.currency]) {
            amount[data.currency] = data.amount || 0;
          } else {
            amount[data.currency] += data.amount || 0;
          }
        }

        // collecting data for ItemCounter component
        products.push(data.product);

        data.productId = data.product._id;

        filteredProductsData.push(data);
      }
    });

    this.setState({ productsData: filteredProductsData, products, amount });
  };

  checkProductsData = () => {
    if (this.state.productsData.length === 0) {
      Alert.error('Select product & service');

      return false;
    }

    return true;
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove
  }: IEditFormContent) => {
    const { item, users, options } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      assignedUserIds,
      customers,
      companies,
      attachments
    } = state;

    return (
      <>
        <Top
          options={options}
          name={name}
          description={description}
          closeDate={closeDate}
          amount={this.renderAmount}
          users={users}
          stageId={stageId}
          item={item}
          onChangeField={onChangeField}
        />

        <FlexContent>
          <Left
            onChangeAttachment={onChangeAttachment}
            type={options.type}
            description={description}
            attachments={attachments}
            item={item}
            onChangeField={onChangeField}
          />

          <Sidebar
            options={options}
            customers={customers}
            companies={companies}
            assignedUserIds={assignedUserIds}
            item={item}
            sidebar={this.renderProductSection}
            onChangeField={onChangeField}
            copyItem={copy}
            removeItem={remove}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const { productsData } = this.state;

    const extendedProps = {
      ...this.props,
      extraFieldsCheck: this.checkProductsData,
      extraFields: { productsData },
      amount: this.renderAmount,
      sidebar: this.renderProductSection,
      formContent: this.renderFormContent
    };

    return <EditForm {...extendedProps} />;
  }
}
