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
import ProductRuleForm from "../containers/ProductRuleForm";
import { IEbarimtProductRule } from "../types";
import ProductRuleRow from "./ProductRuleRow";
import Sidebar from './Sidebar';

type Props = {
  productRules: IEbarimtProductRule[];
  loading: boolean;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IEbarimtProductRule[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  remove: (doc: { ids: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
};

const ProductRuleList = (props: Props) => {
  const {
    productRules,
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
    toggleAll(productRules, "productRules");
  };

  const removeProductRules = productRules => {
    const ids: string[] = productRules.map(pr => pr._id) || [];

    remove({ ids }, emptyBulk);
  };

  const ProductsRuleForm = (formProps) => {
    return <ProductRuleForm {...formProps} queryParams={queryParams} />;
  };

  const handleSearch = e => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
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
        Add Rule
      </Button>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            removeProductRules(bulk);
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
          title={__("New Rule")}
          trigger={addTrigger}
          autoOpenKey="showProductRuleModal"
          size="xl"
          content={ProductsRuleForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__(`Rules (${totalCount})`)}</Title>;

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
                sortField={"title"}
                label={__("Title")}
              />
            </th>
            <th>
              <SortHandler sortField={"kind"} label={__("Kind")} />
            </th>
            <th>
              <SortHandler
                sortField={"taxType"}
                label={__("Tax Type")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"taxCode"}
                label={__("tax Code")}
              />
            </th>
            <th>
              <SortHandler
                sortField={"percent"}
                label={__("Percent")}
              />
            </th>
          </tr>
        </thead>
        <tbody id="productRules">
          {productRules.map(productRule => (
            <ProductRuleRow
              productRule={productRule}
              isChecked={bulk.includes(productRule)}
              key={productRule._id}
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
          title={__(`Rules`)}
          queryParams={queryParams}
          breadcrumb={[{ title: "Rules" }]}
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
          count={productRules.length}
          emptyText={__("Add in your first productRule!")}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default ProductRuleList;
