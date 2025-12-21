import { Button, Input, Label, Switch } from 'erxes-ui';
import {
  IProduct,
  IProductData,
  SelectProductsBulk,
  currentUserState,
} from 'ui-modules';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import FilterButton from './FilterButton';
import ProductTotal from './ProductTotal';
import { ProductsRecordTable } from './ProductRecordTable';
import { useAtomValue } from 'jotai';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';

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
  const [total, setTotal] = useState<{ [currency: string]: number }>({});
  const [unUsedTotal, setUnUsedTotal] = useState<{
    [currency: string]: number;
  }>({});
  const [bothTotal, setBothTotal] = useState<{ [currency: string]: number }>(
    {},
  );
  const [showAdvancedView, setShowAdvancedView] = useState(false);

  const currentUser = useAtomValue(currentUserState);
  const configs = currentUser?.configs || {};
  const currencies = configs?.dealCurrency || [];

  const productRecords = productsData.map((data) => ({
    ...data,
    product: products.find((p) => p._id === data.productId),
  }));
  console.log('ohhh', productRecords, currencies);
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
    const currency = currencies ? currencies[0] : 'MNT';

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

  const updateTotal = (productsData: IProductData[]) => {
    const total: any = {};
    const unUsedTotal: any = {};
    const bothTotal: any = {};
    const tax: any = {};
    const discount: any = {};
    console.log('productsData', productsData);
    productsData.forEach((p) => {
      if (!p.currency) return;

      if (!bothTotal[p.currency]) {
        bothTotal[p.currency] = 0;
      }
      bothTotal[p.currency] += p.amount || 0;

      if (p.tickUsed) {
        if (!total[p.currency]) {
          total[p.currency] = 0;
          tax[p.currency] = { percent: 0, value: 0 };
          discount[p.currency] = { percent: 0, value: 0 };
        }

        discount[p.currency].value += p.discount || 0;
        tax[p.currency].value += p.tax || 0;
        total[p.currency] += p.amount || 0;
      } else {
        if (!unUsedTotal[p.currency]) {
          unUsedTotal[p.currency] = 0;
        }
        unUsedTotal[p.currency] += p.amount || 0;
      }
    });

    for (const currency of Object.keys(discount)) {
      let clearTotal = total[currency] - tax[currency].value;
      tax[currency].percent =
        clearTotal > 0 ? (tax[currency].value * 100) / clearTotal : 0;

      clearTotal = clearTotal + discount[currency].value;
      discount[currency].percent =
        clearTotal > 0 ? (discount[currency].value * 100) / clearTotal : 0;
    }

    setTotal(total);
    setTax(tax);
    setDiscount(discount);
    setBothTotal(bothTotal);
    setUnUsedTotal(unUsedTotal);
  };

  const calculatePerProductAmount = (
    type: string,
    productData: IProductData,
    callUpdateTotal = true,
  ) => {
    const amount = productData.unitPrice * productData.quantity;

    if (amount > 0) {
      if (type === 'discount') {
        productData.discountPercent = (productData.discount * 100) / amount;
      } else {
        productData.discount = (amount * productData.discountPercent) / 100;
      }

      productData.tax =
        ((amount - productData.discount || 0) * productData.taxPercent) / 100;
      productData.amount =
        amount - (productData.discount || 0) + (productData.tax || 0);
    } else {
      productData.tax = 0;
      productData.discount = 0;
      productData.amount = 0;
    }

    if (callUpdateTotal) {
      updateTotal(productsData);
    }
  };

  useEffect(() => {
    updateTotal(productsData);
  }, [productsData]);
  console.log('total', total, unUsedTotal, bothTotal);
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
            <Switch
              checked={showAdvancedView}
              onCheckedChange={(checked) => {
                setShowAdvancedView(checked);
              }}
            />
          </div>
          <FilterButton />
        </div>
      </div>
      <ProductsRecordTable
        products={productRecords || ([] as IProductData[])}
        refetch={refetch}
        dealId={dealId}
        showAdvancedView={showAdvancedView}
      />
      <div className="sticky bottom-0 right-0 left-0 p-2 flex justify-between items-center z-10 bg-white border-t">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            Total Products:{' '}
            <span className="text-primary">{products?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            Total Amount: <ProductTotal type="total" total={total} />
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
