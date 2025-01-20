import { Alert, __, confirm, router } from "@erxes/ui/src/utils";
import { IProduct, IProductCategory } from "../../types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import CategoryList from "../../containers/productCategory/CategoryList";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Form from "@erxes/ui-products/src/containers/ProductForm";
import FormControl from "@erxes/ui/src/components/form/Control";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import ProductsMerge from "./detail/ProductsMerge";
import ProductsPrintAction from "./ProductPrintAction";
import Row from "./ProductRow";
import Spinner from "@erxes/ui/src/components/Spinner";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Table from "@erxes/ui/src/components/table";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import TemporarySegment from "@erxes/ui-segments/src/components/filter/TemporarySegment";
import { Title } from "@erxes/ui/src/styles/main";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isEnabled } from "@erxes/ui/src/utils/core";

interface IProps {
  queryParams: any;
  products: IProduct[];
  productsCount: number;
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  remove: (doc: { productIds: string[] }, emptyBulk: () => void) => void;
  toggleBulk: () => void;
  toggleAll: (targets: IProduct[], containerId: string) => void;
  loading: boolean;
  searchValue: string;
  currentCategory: IProductCategory;
  mergeProducts: () => void;
  duplicateProduct: (_id: string) => void;
  mergeProductLoading;
}

const List: React.FC<IProps> = props => {
  let timer;

  const {
    products,
    toggleBulk,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    loading,
    currentCategory,
    isAllSelected,
    mergeProductLoading,
    mergeProducts,
    duplicateProduct,
    productsCount,
    queryParams
  } = props;

  const [searchValue, setSearchValue] = useState<string>(props.searchValue);
  const [checked, setChecked] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (checked && !(bulk || []).length) {
      setChecked(false);
      router.removeParams(navigate, location, "page", "ids");
    }
  }, [checked, bulk]);

  const renderRow = () => {
    return products.map(product => (
      <Row
        key={product._id}
        product={product}
        toggleBulk={toggleBulk}
        isChecked={(bulk || []).map(b => b._id).includes(product._id)}
        duplicateProduct={duplicateProduct}
      />
    ));
  };

  const onChange = () => {
    toggleAll(products, "products");

    if (bulk.length === products.length) {
      router.removeParams(navigate, location, "ids");
      router.setParams(navigate, location, { page: 1 });
    }
  };

  const removeProducts = products => {
    const productIds: string[] = [];

    products.forEach(product => {
      productIds.push(product._id);
    });

    remove({ productIds }, emptyBulk);
  };

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    if (currentCategory.productCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    return (
      <>
        <Table $hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl
                  checked={isAllSelected}
                  componentclass="checkbox"
                  onChange={onChange}
                />
              </th>
              <th>{__("Code")}</th>
              <th>{__("Name")}</th>
              <th>{__("Type")}</th>
              <th>{__("Category")}</th>
              <th>{__("Unit Price")}</th>
              <th>{__("Tags")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Product & Service") }
  ];

  const onChangeChecked = e => {
    const checked = e.target.checked;

    if (checked && (bulk || []).length) {
      setChecked(true);
      setSearchValue("");
      router.removeParams(
        navigate,
        location,
        "page",
        "searchValue",
        "categoryId"
      );
      router.setParams(navigate, location, {
        ids: (bulk || []).map(b => b._id).join(",")
      });
    } else {
      setChecked(false);
      router.removeParams(navigate, location, "page", "ids");
    }
  };

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add items
    </Button>
  );

  const modalContent = props => <Form {...props} />;

  const productsMerge = props => {
    return (
      <ProductsMerge
        {...props}
        objects={bulk}
        save={mergeProducts}
        mergeProductLoading={mergeProductLoading}
      />
    );
  };

  const actionBarRight = () => {
    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeProducts(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      const mergeButton = (
        <Button btnStyle="success" icon="merge">
          Merge
        </Button>
      );

      const tagButton = (
        <Button btnStyle="success" icon="tag-alt">
          Tag
        </Button>
      );

      return (
        <BarItems>
          <FormControl
            componentclass="checkbox"
            onChange={onChangeChecked}
            checked={checked}
          />
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={search}
            value={searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Product"
              size="lg"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={productsMerge}
            />
          )}
          <ProductsPrintAction bulk={bulk} />
          <TaggerPopover
            type={TAG_TYPES.PRODUCT}
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
            perPage={1000}
            refetchQueries={["productCountByTags"]}
          />

          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            Remove
          </Button>
        </BarItems>
      );
    }

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={search}
          value={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />

        <TemporarySegment btnSize="medium" contentType={`core:product`} />

        <Link to="/settings/importHistories?type=product">
          <Button btnStyle="simple" icon="arrow-from-right">
            {__("Import items")}
          </Button>
        </Link>
        <ModalTrigger
          title="Add Product/Services"
          trigger={trigger}
          autoOpenKey="showProductModal"
          content={modalContent}
          size="xl"
        />
      </BarItems>
    );
  };

  const actionBarLeft = (
    <Title>{`${currentCategory.name || "All products"} (${productsCount})`}</Title>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Product & Service")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
          extraFilterParams={[{ param: 'image', bool: false }]}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"Product & Service"}
          description={`${__(
            "All information and know-how related to your business products and services are found here"
          )}.${__(
            "Create and add in unlimited products and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
      }
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={productsCount} />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default List;
