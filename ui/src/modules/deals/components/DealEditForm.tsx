import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent, HeaderContentSmall } from 'modules/boards/styles/item';
import { IEditFormContent, IItem, IOptions } from 'modules/boards/types';
import ControlLabel from 'modules/common/components/form/Label';
import ProductSection from 'modules/deals/components/ProductSection';
import { IProduct } from 'modules/settings/productService/types';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import { pluginsOfItemSidebar } from 'pluginUtils';
import React from 'react';
import { IDeal, IDealParams, IPaymentsData } from '../types';

type Props = {
  options: IOptions;
  item: IDeal;
  addItem: (doc: IDealParams, callback: () => void) => void;
  saveItem: (doc: IDealParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: (afterPopupClose?: () => void) => void;
  sendToBoard?: (item: any) => void;
};

type State = {
  amount: any;
  products: IProduct[];
  productsData: any;
  paymentsData: IPaymentsData;
  changePayData: IPaymentsData;
  updatedItem?: IItem;
};

export default class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      amount: item.amount || {},
      productsData: item.products ? item.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: item.products ? item.products.map(p => p.product) : [],
      paymentsData: item.paymentsData,
      changePayData: {}
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
    const { productsData, paymentsData } = this.state;
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

    Object.keys(paymentsData || {}).forEach(key => {
      const perData = paymentsData[key];

      if (!perData.currency || !perData.amount || perData.amount === 0) {
        delete paymentsData[key];
      }
    });

    this.setState(
      { productsData: filteredProductsData, products, amount, paymentsData },
      () => {
        saveItem({ productsData, paymentsData }, updatedItem => {
          this.setState({ updatedItem });
        });
      }
    );
  };

  beforePopupClose = (afterPopupClose?: () => void) => {
    const { updatedItem } = this.state;
    const { onUpdate, beforePopupClose } = this.props;

    if (beforePopupClose) {
      beforePopupClose(() => {
        if (updatedItem && onUpdate) {
          onUpdate(updatedItem);
        }

        if (afterPopupClose) {
          afterPopupClose();
        }
      });
    }
  };

  renderProductSection = () => {
    const { products, productsData, paymentsData } = this.state;

    const pDataChange = pData => this.onChangeField('productsData', pData);
    const prsChange = prs => this.onChangeField('products', prs);
    const payDataChange = payData =>
      this.onChangeField('paymentsData', payData);

    return (
      <ProductSection
        onChangeProductsData={pDataChange}
        onChangeProducts={prsChange}
        onChangePaymentsData={payDataChange}
        productsData={productsData}
        paymentsData={paymentsData}
        products={products}
        saveProductsData={this.saveProductsData}
      />
    );
  };

  renderItems = () => {
    const { item } = this.props
    return (
      <>
        <PortableTickets mainType="deal" mainTypeId={item._id} />
        <PortableTasks mainType="deal" mainTypeId={item._id} />
        {pluginsOfItemSidebar(item, "deal")}
      </>
    );
  };

  renderFormContent = ({
    saveItem,
    onChangeStage,
    copy,
    remove
  }: IEditFormContent) => {
    const { item, options, onUpdate, addItem, sendToBoard } = this.props;

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
            sendToBoard={sendToBoard}
            item={item}
            addItem={addItem}
            onChangeStage={onChangeStage}
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
      formContent: this.renderFormContent,
      beforePopupClose: this.beforePopupClose
    };

    return <EditForm {...extendedProps} />;
  }
}