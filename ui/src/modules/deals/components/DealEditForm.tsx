import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent, HeaderContentSmall } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import ControlLabel from 'modules/common/components/form/Label';
import ProductSection from 'modules/deals/components/ProductSection';
import { IProduct } from 'modules/settings/productService/types';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { IDeal, IDealParams } from '../types';

type Props = {
  options: IOptions;
  item: IDeal;
  addItem: (doc: IDealParams, callback: () => void) => void;
  saveItem: (doc: IDealParams, callback?: (item) => void) => void;
  copyItem:(itemId: string, callback: () => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
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

  saveProductsData = () => {
    const { productsData } = this.state;
    const { saveItem } = this.props;
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

    this.setState(
      { productsData: filteredProductsData, products, amount },
      () => {
        saveItem({ productsData: this.state.productsData }, updatedItem => {
          this.props.onUpdate(updatedItem);
        });
      }
    );
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

  renderItems = () => {
    return (
      <>
        <PortableTickets mainType="deal" mainTypeId={this.props.item._id} />
        <PortableTasks mainType="deal" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    saveItem,
    onChangeStage,
    copy,
    remove
  }: IEditFormContent) => {
    const { item, options, onUpdate, addItem } = this.props;

    return (
      <>
        <Top
          options={options}
          amount={this.renderAmount}
          stageId={item.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
        />

        <FlexContent>
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            item={item}
            addItem={addItem}
          />

          <Sidebar
            options={options}
            item={item}
            sidebar={this.renderProductSection}
            saveItem={saveItem}
            renderItems={this.renderItems}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      amount: this.renderAmount,
      sidebar: this.renderProductSection,
      formContent: this.renderFormContent
    };

    return <EditForm {...extendedProps} />;
  }
}
