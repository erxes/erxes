/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Input, Label, Switch } from 'erxes-ui';
import {
  IProduct,
  IProductData,
  SelectProductsBulk,
  currentUserState,
} from 'ui-modules';
import { IconPlus, IconSearch } from '@tabler/icons-react';

import FilterButton from './FilterButton';
import { ProductsRecordTable } from './ProductRecordTable';
import { useAtomValue } from 'jotai';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';
import { useState } from 'react';

const ProductsList = ({
  products,
  productsData,
  dealId,
  refetch,
}: {
  products: IProduct[];
  productsData: IProductData[];
  dealId: string;
  refetch: () => void;
}) => {
  const { createDealsProductData } = useDealsCreateProductsData();

  const [vatPercent, setVatPercent] = useState(0);
  const [discount, setDiscount] = useState<{
    [currency: string]: { value?: number; percent?: number };
  }>({});
  const [tax, setTax] = useState<{
    [currency: string]: { value?: number; percent?: number };
  }>({});
  // const [total, setTotal] = useState<{ [currency: string]: number }>({});

  const currentUser = useAtomValue(currentUserState);
  const configs = currentUser?.configs || {};
  const currencies = configs?.dealCurrency || [];

  const productRecords = productsData.map((data) => ({
    ...data,
    product: products.find((p) => p._id === data.productId),
  }));

  const applyVat = () => {
    // const { productsData, onChangeProductsData } = this.props;
    // const { vatPercent } = this.state;
    // const updatedData = (productsData || []).map(p => {
    //   const pData = {
    //     ...p,
    //     isVatApplied: true,
    //     unitPrice: p.isVatApplied
    //       ? p.unitPrice
    //       : parseFloat(
    //           ((p.unitPrice * 100) / (100 + (vatPercent || 0))).toFixed(4)
    //         ),
    //   };
    //   this.calculatePerProductAmount("", pData, false);
    //   return pData;
    // });
    // onChangeProductsData(updatedData);
    // this.updateTotal(updatedData);
  };

  const onPoductBulkSave = (selectedProducts: IProduct[]) => {
    if (!selectedProducts) return;
    const currency = currencies ? currencies[0] : '';

    const docs: any[] = [];
    for (const product of selectedProducts) {
      const productData = {
        tax: 0,
        taxPercent: tax[currency] ? tax[currency].percent || 0 : 0,
        discount: 0,
        vatPercent: 0,
        discountPercent: discount[currency]
          ? discount[currency].percent || 0
          : 0,
        amount: 0,
        currency,
        // tickUsed: dealQuery.stage?.defaultTick === false ? false : true, // undefined or null then true
        maxQuantity: 0,
        product,
        quantity: 1,
        productId: product._id,
        unitPrice: product.unitPrice,
        globalUnitPrice: product.unitPrice,
        unitPricePercent: 100,
        _id: Math.random().toString(),
      };
      docs.push(productData);
    }

    const processId = Math.random().toString();
    localStorage.setItem('processId', processId);

    createDealsProductData({
      variables: {
        processId,
        dealId,
        docs,
      },
    });
  };

  return (
    <div>
      <div className=" flex">
        <Input
          placeholder="Vat percent"
          className="w-[40%]"
          value={vatPercent}
          onChange={(e) => setVatPercent(Number.parseInt(e.target.value))}
        />
        <Button className="ml-3" onClick={() => applyVat()}>
          Apply VAT
        </Button>
      </div>
      <div className="w-full mt-3 flex items-center justify-between">
        <div className="relative w-[45%]">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input placeholder="Search" className="pl-9 w-full" />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <Label className="mr-3 ">Advanced view</Label>
            <Switch />
          </div>
          <FilterButton />
        </div>
      </div>
      <ProductsRecordTable
        products={productRecords || ([] as IProductData[])}
        refetch={refetch}
        dealId={dealId}
      />
      <div className="sticky bottom-0 right-0 left-0 p-2 flex justify-between items-center z-10 bg-white border-t">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            Total Products:{' '}
            <span className="text-primary">{products?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            Total Amount: <span className="text-primary">{0}</span>
          </div>
        </div>
        <SelectProductsBulk
          productIds={[]}
          onSelect={(productIds, selectedProducts) =>
            onPoductBulkSave(selectedProducts || ([] as IProduct[]))
          }
        >
          <Button>
            <IconPlus />
            Add Many Products
          </Button>
        </SelectProductsBulk>
      </div>
    </div>
  );
};

export default ProductsList;
