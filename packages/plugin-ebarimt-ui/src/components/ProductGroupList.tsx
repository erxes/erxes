import { FlexRow, Title } from "@erxes/ui-settings/src/styles";
import {
  Alert,
  BarItems,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  Wrapper
} from "@erxes/ui/src";
import { confirm } from "@erxes/ui/src/utils";
import { __, router } from "@erxes/ui/src/utils/core";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductGroupForm from "../containers/ProductGroupForm";
import { IEbarimtProductGroup } from "../types";
import ProductGroupRow from "./ProductGroupRow";
import Sidebar from './Sidebar';

type Props = {
  productGroups: IEbarimtProductGroup[];
  loading: boolean;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IEbarimtProductGroup[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  remove: (doc: { ids: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
};

const ProductGroupList = (props: Props) => {
  const {
    productGroups,
    loading,
    totalCount,
    toggleBulk,
    toggleAll,
    bulk,
    isAllSelected,
    emptyBulk,
    remove,
    queryParams
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<number | null>(null);
  const [search, setSearch] = useState<string>(queryParams.searchValue || '');

  const onChange = () => {
    toggleAll(productGroups, "productGroups");
  };

  const removeProductGroups = productGroups => {
    const ids: string[] = productGroups.map(pr => pr._id) || [];

    remove({ ids }, emptyBulk);
  };

  const ProductsGroupForm = (formProps) => {
    return <ProductGroupForm {...formProps} queryParams={queryParams} />;
  };

  const handleSearch = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { value } = e.target;
    setSearch(value);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue: value });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const renderActionBarRight = () => {
    const addTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Group
      </Button>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeProductGroups(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      return (
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          Delete
        </Button>
      );
    }

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Type to search")}
          onChange={handleSearch}
          value={search}
          autoFocus={true}
          onFocus={moveCursorAtTheEnd}
        />

        <ModalTrigger
          title={__("New Group")}
          trigger={addTrigger}
          autoOpenKey="showProductGroupModal"
          size="xl"
          content={ProductsGroupForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__(`Groups (${totalCount})`)}</Title>;

    const actionBarRight = <FlexRow>{renderActionBarRight()}</FlexRow>;

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  };

  const renderContent = () => {
    return (
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler
                label={__("Main Product")}
              />
            </th>
            <th>
              <SortHandler
                label={__("Sub Product")}
              />
            </th>
            <th>
              <SortHandler
                label={__("Sort Number")}
              />
            </th>
            <th>
              <SortHandler
                label={__("Ratio")}
              />
            </th>
            <th>
              <SortHandler sortField={"isActive"} label={__("Is Active")} />
            </th>
          </tr>
        </thead>
        <tbody id="productGroups">
          {productGroups.map(productGroup => (
            <ProductGroupRow
              productGroup={productGroup}
              isChecked={bulk.includes(productGroup)}
              key={productGroup._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Groups`)}
          queryParams={queryParams}
          breadcrumb={[{ title: "Groups" }]}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={totalCount} />}
      leftSidebar={<Sidebar />}
      hasBorder={true}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={productGroups.length}
          emptyText={__("Add in your first productGroup!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default ProductGroupList;
