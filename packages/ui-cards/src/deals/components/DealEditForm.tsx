import { IDeal, IDealParams, IPaymentsData } from '../types';
import { IEditFormContent, IItem, IOptions } from '../../boards/types';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditForm from '../../boards/components/editForm/EditForm';
import { Flex } from '@erxes/ui/src/styles/main';
import { HeaderContentSmall } from '../../boards/styles/item';
import { IProduct } from '@erxes/ui-products/src/types';
import Left from '../../boards/components/editForm/Left';
import PortableTasks from '../../tasks/components/PortableTasks';
import PortableTickets from '../../tickets/components/PortableTickets';
import ProductSection from './ProductSection';
import React from 'react';
import Sidebar from '../../boards/components/editForm/Sidebar';
import Top from '../../boards/components/editForm/Top';
import { pluginsOfItemSidebar } from 'coreui/pluginUtils';

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
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
};

type State = {
  amount: any;
  products: IProduct[];
  productsData: any;
  paymentsData: IPaymentsData;
  changePayData: IPaymentsData;
  updatedItem?: IItem;
  refresh: boolean;
};

export default class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      amount: item.amount || {},
      productsData: item.products ? item.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: item.products
        ? item.products.map(p => {
            p.product.quantity = p.quantity;
            p.product.uom = p.uom;

            return p.product;
          })
        : [],
      paymentsData: item.paymentsData,
      changePayData: {},
      refresh: false
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

  onChangeRefresh = () => {
    this.setState({
      refresh: !this.state.refresh
    });
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
        dealQuery={this.props.item}
      />
    );
  };

  renderItems = () => {
    const { item } = this.props;
    return (
      <>
        <PortableTickets mainType="deal" mainTypeId={item._id} />
        <PortableTasks mainType="deal" mainTypeId={item._id} />
        {pluginsOfItemSidebar(item, 'deal')}
      </>
    );
  };

  renderFormContent = ({
    saveItem,
    onChangeStage,
    copy,
    remove
  }: IEditFormContent) => {
    const {
      item,
      options,
      onUpdate,
      addItem,
      sendToBoard,
      updateTimeTrack
    } = this.props;

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

        <Flex>
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
            onChangeRefresh={this.onChangeRefresh}
          />

          <Sidebar
            options={options}
            item={item}
            updateTimeTrack={updateTimeTrack}
            sidebar={this.renderProductSection}
            saveItem={saveItem}
            renderItems={this.renderItems}
          />
        </Flex>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      amount: this.renderAmount,
      sidebar: this.renderProductSection,
      formContent: this.renderFormContent,
      beforePopupClose: this.beforePopupClose,
      refresh: this.state.refresh
    };

    return <EditForm {...extendedProps} />;
  }
}
