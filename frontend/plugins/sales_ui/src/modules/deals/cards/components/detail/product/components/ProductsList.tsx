import { Button, Input, Label, Switch } from 'erxes-ui';
import { IconPlus, IconSearch } from '@tabler/icons-react';

import FilterButton from './FilterButton';
import { IProduct } from 'ui-modules';
import { ProductAddSheet } from './ProductAddSheet';
import { ProductsRecordTable } from './ProductRecordTable';
import { SelectProductsBulk } from './SelectProductsBulk';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';
import { useState } from 'react';

const ProductsList = ({
  products,
  dealId,
}: {
  products: IProduct[];
  dealId: string;
}) => {
  const { createDealsProductData } = useDealsCreateProductsData();
  const [vatPercent, setVatPercent] = useState(0);
  const [discount, setDiscount] = useState<{
    [currency: string]: { value?: number; percent?: number };
  }>({});
  const [tax, setTax] = useState<{
    [currency: string]: { value?: number; percent?: number };
  }>({});

  const currentUser = useAtomValue(currentUserState);
  const configs = currentUser?.configs || {};
  const currencies = configs?.dealCurrency || [];

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
          onChange={(e) => setVatPercent(parseInt(e.target.value))}
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
      <ProductsRecordTable products={products || ([] as IProduct[])} />
      <div className="flex justify-end mt-2 mb-5 mr-5 gap-2">
        <ProductAddSheet />
        <SelectProductsBulk
          productIds={[]}
          onSave={(selectedProducts) =>
            onPoductBulkSave(selectedProducts || ([] as IProduct[]))
          }
        >
          <Button variant="secondary" className="bg-border">
            <IconPlus />
            Add Many Products
          </Button>
        </SelectProductsBulk>
      </div>
    </div>
  );
};

export default ProductsList;
