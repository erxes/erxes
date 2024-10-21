import React, { useRef, useState } from "react";
import { can, router } from "@erxes/ui/src/utils/core";

import { BarItems } from "@erxes/ui/src/layout/styles";
import CollateralRow from "./CollateralRow";
import { CollateralsTableWrapper } from "../styles";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ICollateral } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import Sidebar from "./Sidebar";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { menuContracts } from "../../constants";
import withConsumer from "../../withConsumer";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  collaterals: ICollateral[];
  loading: boolean;
  searchValue: string;
  productIds: string[];
  totalCount: number;
  queryParams: any;
  currentUser: IUser;
}

const CollateralsList = (props: IProps) => {
  const timerRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState(props.searchValue);
  const [productIds, setProductIds] = useState(props.productIds);
  const location = useLocation();
  const navigate = useNavigate();

  const { collaterals, loading, totalCount, queryParams, currentUser } = props;

  const onSelectProducts = (productIds) => {
    setProductIds(productIds);
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { productIds });
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = setTimeout(() => {
      navigate(`/settings/contract-types?searchValue=${value}`);
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const mainContent = (
    <CollateralsTableWrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $striped={true}
      >
        <thead>
          <tr>
            <th>
              <SortHandler sortField={"code"} label={__("Code")} />
            </th>
            <th>
              <SortHandler sortField={"name"} label={__("Name")} />
            </th>
            <th>
              <SortHandler
                sortField={"certificate"}
                label={__("Certificate №")}
              />
            </th>
            <th>
              <SortHandler sortField={"vinNumber"} label={__("VINNumber")} />
            </th>
            <th>
              <SortHandler sortField={"cost"} label={__("Cost")} />
            </th>
            <th>
              <SortHandler
                sortField={"marginAmount"}
                label={__("margin Amount")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"leaseAmount"}
                label={__("Lease Amount")}
              />
            </th>
          </tr>
        </thead>
        <tbody id="collaterals">
          {collaterals.map((collateral) => (
            <CollateralRow
              collateral={collateral}
              key={`${
                collateral.collateralData
                  ? collateral.collateralData._id
                  : collateral._id
              }`}
            />
          ))}
        </tbody>
      </Table>
    </CollateralsTableWrapper>
  );

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
      <SelectProducts
        label={__("Filter by products")}
        name="productIds"
        queryParams={queryParams}
        onSelect={onSelectProducts}
      />
    </BarItems>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Collaterals`) + ` (${totalCount})`}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser)
          )}
        />
      }
      actionBar={actionBar}
      hasBorder
      footer={<Pagination count={totalCount} />}
      leftSidebar={
        <Sidebar
          loadingMainQuery={loading}
          queryParams={queryParams}
        />
      }
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={collaterals.length}
          emptyText={__("Add in your first collateral!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(CollateralsList);
