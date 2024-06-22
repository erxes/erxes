import CategoryList from "../containers/CategoryList";
import RightMenu from "./RightMenu";
import React, { useRef, useState } from "react";
import Row from "./ProductRow";
import {
  __,
  BarItems,
  DataWithLoader,
  EmptyState,
  FormControl,
  Pagination,
  router,
  Table,
  Wrapper,
} from "@erxes/ui/src";
import { IPosProduct } from "../types";
import { IProductCategory } from "@erxes/ui-products/src/types";
import { IQueryParams } from "@erxes/ui/src/types";
import { menuPos } from "../../constants";
import { Title } from "@erxes/ui-settings/src/styles";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  products: IPosProduct[];
  totalCount: number;
  loading: boolean;
  searchValue: string;
  currentCategory: IProductCategory;

  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: boolean;
  clearFilter: () => void;
  onFilter: (filterParams: IQueryParams) => void;
};

const ProductList = (props: Props) => {
  const {
    products,
    loading,
    queryParams,
    onSelect,
    onSearch,
    isFiltered,
    clearFilter,
    onFilter,
    totalCount,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const timerRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState(queryParams.searchValue || "");

  const renderRow = () => {
    return products.map((product) => (
      <Row key={product._id} product={product} />
    ));
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);
    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;

    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderContent = () => {
    if (totalCount === 0) {
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
              <th>{__("Code")}</th>
              <th>{__("Name")}</th>
              <th>{__("Category")}</th>
              <th>{__("Unit Price")}</th>
              <th>{__("<10")}</th>
              <th>{__("10")}</th>
              <th>{__("11")}</th>
              <th>{__("12")}</th>
              <th>{__("13")}</th>
              <th>{__("14")}</th>
              <th>{__("15")}</th>
              <th>{__("16")}</th>
              <th>{__("17")}</th>
              <th>{__("18")}</th>
              <th>{__("19")}</th>
              <th>{__("20")}</th>
              <th>{__("21<")}</th>
              <th>{__("Pos Sale")}</th>
              <th>{__("Pos Amount")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </>
    );
  };

  const renderActionBar = () => {
    const rightMenuProps = {
      onSelect,
      onSearch,
      isFiltered,
      clearFilter,
      queryParams,
      onFilter,
    };

    const actionBarLeft = <Title>{__("Pos Products")}</Title>;

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={search}
          defaultValue={searchValue}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />
        <RightMenu {...rightMenuProps} />
      </BarItems>
    );

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  };

  return (
    <Wrapper
      hasBorder={true}
      header={
        <Wrapper.Header title={__("POS of Products")} submenu={menuPos} />
      }
      actionBar={renderActionBar()}
      leftSidebar={<CategoryList queryParams={queryParams} />}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
    />
  );
};

export default ProductList;
