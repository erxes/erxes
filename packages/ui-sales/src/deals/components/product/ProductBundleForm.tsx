import {
  Add,
  FlexRowGap,
  FooterInfo,
  FormContainer,
  ProductButton
} from "../../styles";
import lodash from "lodash";
import { Alert, __ } from "@erxes/ui/src/utils";
import {
  EmptyState,
  FormControl,
  ModalTrigger,
  Table
} from "@erxes/ui/src/components";
import {
  IDeal,
  IDealBundleItem,
  IPaymentsData,
  IProductData
} from "../../types";
import {
  BundleRuleQueryResponse,
  IBundleRule,
  IBundleRuleItem,
  IProduct
} from "@erxes/ui-products/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import {
  mutations as productMutations,
  queries as productQueries
} from "../../graphql";
import ProductChooser from "@erxes/ui-products/src/containers/ProductChooser";
const TableWrapper = styled.div`
  overflow: auto;

  table thead tr th {
    font-size: 10px;
    white-space: nowrap;
  }

  .css-13cymwt-control,
  .css-t3ipsp-control,
  .css-1nmdiq5-menu {
    width: max-content;
  }
`;

const ApplyVatWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;

  > div {
    flex: inherit;
  }

  input {
    width: 100px;
  }
`;

type Props = {
  bundleId: string;
  onChangeBundle: (conditions: IDealBundleItem[]) => void;
  conditions: IDealBundleItem[];
};

const ProductBundleForm = ({ bundleId, onChangeBundle, conditions }: Props) => {
  const { data, loading } = useQuery<BundleRuleQueryResponse>(
    gql(productQueries.bundleRuleDetail),
    {
      variables: {
        id: bundleId
      }
    }
  );
  const [bundleData, setBundleData] = useState<IDealBundleItem[]>();

  const renderProductModal = (item: IDealBundleItem, index: number) => {
    const productOnChange = (products: IProduct[]) => {
      const product =
        products && products.length === 1 ? products[0] : undefined;

      let copiedData = [...(bundleData || [])];
      copiedData[index].selectedProduct = product;
      copiedData[index].selectedProductId = product?._id || "";

      if (product) {
        if (item.bundleSnapshot?.priceType === "thisProductPricePercent") {
          copiedData[index].total =
            (item.count * (product.unitPrice * item?.bundleSnapshot.percent)) /
            100;
        } else if (item?.bundleSnapshot?.priceType === "price") {
          copiedData[index].total =
            item.count * item?.bundleSnapshot?.priceValue;
        }
      }

      setBundleData(copiedData);
      onChangeBundle(copiedData);
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        ids={item?.bundleSnapshot?.productIds}
        data={{
          name: "Product",
          products: item.selectedProduct ? [item.selectedProduct] : []
        }}
        limit={1}
      />
    );
    const renderProductServiceTrigger = (product?: IDealBundleItem) => {
      let content = (
        <div>
          {__("Choose Product & Service")} <Icon icon="plus-circle" />
        </div>
      );

      // if product selected
      if (product?.selectedProduct) {
        content = (
          <div>
            {product?.selectedProduct.code} - {product?.selectedProduct.name}
            <Icon icon="pen-1" />
          </div>
        );
      }

      return <ProductButton>{content}</ProductButton>;
    };
    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={renderProductServiceTrigger(item)}
        dialogClassName="modal-1400w"
        size="xl"
        content={content}
      />
    );
  };
  const renderContent = () => {
    if (data?.bundleRuleDetail.rules.length === 0) {
      return (
        <EmptyState size="full" text="No product or services" icon="box" />
      );
    }
    const onChange = (e, index) => {
      let copiedData = [...(bundleData || [])];

      copiedData[index].count = Number((e.target as HTMLInputElement).value);

      const item = copiedData[index];

      if (copiedData[index].selectedProduct) {
        if (item.bundleSnapshot?.priceType === "thisProductPricePercent") {
          copiedData[index].total =
            (copiedData[index].count *
              (copiedData[index].selectedProduct.unitPrice *
                item.bundleSnapshot?.percent)) /
            100;
        } else if (item?.bundleSnapshot?.priceType === "price") {
          copiedData[index].total =
            copiedData[index].count * item.bundleSnapshot.priceValue;
        }
      }
      setBundleData(copiedData);
      onChangeBundle(copiedData);
    };

    return (
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>{__("Bundle Code")}</th>

              <th>{__("Product / Service")}</th>
              <th>{__("Price Rule")}</th>
              <th>{__("Price Rule Value")}</th>
              <th style={{ width: "30px" }}>{__("Quantity")}</th>
              <th>{__("Total")}</th>
            </tr>
          </thead>
          <tbody id="products1">
            {bundleData?.map((item, index) => (
              <tr>
                <th>{item.bundleCode}</th>
                <th>{renderProductModal(item, index)}</th>
                <th>
                  {item.bundleSnapshot?.priceType == "price"
                    ? "Fixed Price"
                    : "Percentage"}
                </th>
                <th>
                  {item.bundleSnapshot?.priceType == "price"
                    ? item.bundleSnapshot?.priceValue
                    : `${item.bundleSnapshot?.percent} %`}
                </th>

                <th>
                  <FormControl
                    defaultValue={item.count || 0}
                    type="number"
                    min={0}
                    max={item.bundleSnapshot?.quantity}
                    placeholder="0"
                    name="quantity"
                    onChange={e => onChange(e, index)}
                  />
                </th>
                <th>{item.total}</th>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  const trigger = <Icon icon="file-search-alt" />;
  useEffect(() => {
    if (conditions.length > 0) {
      setBundleData(
        conditions.map(item => ({
          ...item,
          selectedProduct: item.bundleSnapshot?.products.find(
            x => x._id === item.selectedProductId
          )
        }))
      );
    } else {
      if (data?.bundleRuleDetail && data?.bundleRuleDetail.rules?.length > 0) {
        const items = data.bundleRuleDetail.rules.map(item => ({
          bundleCode: item.code,
          count: 0,
          total: 0,
          selectedProductId: "",
          // selectedProduct: null,
          bundleSnapshot: item
        }));
        setBundleData(items);
      }
    }
  }, [data, conditions]);
  return (
    <ModalTrigger
      title={`${data?.bundleRuleDetail.name}`}
      trigger={trigger}
      dialogClassName="modal-1400w"
      size="xl"
      content={renderContent}
    />
  );
};

export default ProductBundleForm;
