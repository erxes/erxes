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
import React, { useEffect, useState } from 'react';
import { IDeal, IDealParams } from '../types';

type Props = {
  options: IOptions;
  item: IDeal;
  addItem: (doc: IDealParams, callback: () => void) => void;
  saveItem: (doc: IDealParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  sendToBoard?: (item: any) => void;
};

export default function DealEditForm(props: Props) {
  const item = props.item;

  const [amount, setAmount] = useState(item.amount || {});
  const [productsData, setProductsData] = useState(
    item.products ? item.products.map(p => ({ ...p })) : []
  );
  const [products, setProducts] = useState(
    item.products ? item.products.map(p => p.product) : []
  );
  const [paymentsData, setPaymentsData] = useState(item.paymentsData || {});

  useEffect(
    () => {
      setAmount(item.amount || {});
      setProductsData(item.products ? item.products.map(p => ({ ...p })) : []);
      setProducts(item.products ? item.products.map(p => p.product) : []);
      setPaymentsData(item.paymentsData || {});
    },
    [item]
  );

  function renderAmount() {
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
  }

  function saveProductsData() {
    const { saveItem } = props;
    const newProducts: IProduct[] = [];
    const newAmount: any = {};

    const filteredProductsData: any = [];

    productsData.forEach(data => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating item amount
          if (!newAmount[data.currency]) {
            newAmount[data.currency] = data.amount || 0;
          } else {
            newAmount[data.currency] += data.amount || 0;
          }
        }

        // collecting data for ItemCounter component
        newProducts.push(data.product);

        data.productId = data.product._id;

        filteredProductsData.push(data);
      }
    });

    setAmount(newAmount);
    setProducts(newProducts);
    setProductsData(filteredProductsData);

    // need to be implemented a callback
    saveItem({ productsData }, updatedItem => {
      props.onUpdate(updatedItem);
    });
  }

  function savePaymentsData() {
    const { saveItem } = props;

    Object.keys(paymentsData || {}).forEach(key => {
      const perData = paymentsData[key];

      if (!perData.currency || !perData.amount || perData.amount === 0) {
        delete paymentsData[key];
      }
    });

    setPaymentsData(paymentsData);

    // need to be implemented a callback
    saveItem({ paymentsData }, updatedItem => {
      props.onUpdate(updatedItem);
    });
  }

  function renderProductSection() {
    return (
      <ProductSection
        onChangeProductsData={setProductsData}
        onChangeProducts={setProducts}
        onChangePaymentsData={setPaymentsData}
        productsData={productsData}
        paymentsData={paymentsData}
        products={products}
        saveProductsData={saveProductsData}
        savePaymentsData={savePaymentsData}
      />
    );
  }

  function renderItems() {
    return (
      <>
        <PortableTickets mainType="deal" mainTypeId={props.item._id} />
        <PortableTasks mainType="deal" mainTypeId={props.item._id} />
      </>
    );
  }

  function renderFormContent({
    saveItem,
    onChangeStage,
    copy,
    remove
  }: IEditFormContent) {
    const { options, onUpdate, addItem, sendToBoard } = props;

    return (
      <>
        <Top
          options={options}
          amount={renderAmount}
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
          />

          <Sidebar
            options={options}
            item={item}
            sidebar={renderProductSection}
            saveItem={saveItem}
            renderItems={renderItems}
          />
        </FlexContent>
      </>
    );
  }

  const extendedProps = {
    ...props,
    amount: renderAmount,
    sidebar: renderProductSection,
    formContent: renderFormContent
  };

  return <EditForm {...extendedProps} />;
}
