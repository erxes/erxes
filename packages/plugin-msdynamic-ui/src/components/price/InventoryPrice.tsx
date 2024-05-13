import {
  CollapseContent,
  DataWithLoader,
  Pagination,
  Table,
} from "@erxes/ui/src/components";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import React from "react";
import Row from "./InventoryPriceRow";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import { menuDynamic } from "../../constants";

type Props = {
  queryParams: any;
  loading: boolean;
  setBrand: (brandId: string) => void;
  toSyncPrices: () => void;
  items: any;
};

const InventoryPrice = ({
  items,
  loading,
  queryParams,
  setBrand,
  toSyncPrices,
}: Props) => {
  const checkButton = (
    <BarItems>
      <span>{items && items.matched && `Matched: ${items.matched.count}`}</span>
      <SelectBrands
        label={__("Choose brands")}
        onSelect={(brand) => setBrand(brand as string)}
        initialValue={queryParams.brandId}
        multi={false}
        name="selectedBrands"
        customOption={{
          label: "No Brand (noBrand)",
          value: "",
        }}
      />

      <Button
        btnStyle="warning"
        size="small"
        icon="check-1"
        onClick={toSyncPrices}
      >
        Sync
      </Button>
    </BarItems>
  );

  const header = <Wrapper.ActionBar right={checkButton} />;

  const calculatePagination = (data: any) => {
    if (Object.keys(queryParams).length !== 1) {
      if (queryParams.perPage !== undefined && queryParams.page === undefined) {
        data = data.slice(queryParams.perPage * 0, queryParams.perPage * 1);
      }

      if (queryParams.page !== undefined) {
        if (queryParams.perPage !== undefined) {
          data = data.slice(
            Number(queryParams.page - 1) * queryParams.perPage,
            Number((queryParams.page - 1) * queryParams.perPage) +
              Number(queryParams.perPage)
          );
        } else {
          data = data.slice(
            (queryParams.page - 1) * 20,
            (queryParams.page - 1) * 20 + 20
          );
        }
      }
    } else {
      data = data.slice(0, 20);
    }

    return data;
  };

  const renderTable = (data: any, action: string) => {
    data = calculatePagination(data);

    const renderRow = (rowData: any, rowSction: string) => {
      if (rowData.length > 100) {
        rowData = rowData.slice(0, 100);
      }

      return rowData.map((p) => (
        <Row key={p.code} price={p} action={rowSction} />
      ));
    };

    return (
      <>
        <Table $hover={true}>
          <thead>
            <tr>
              <th>{__("Code")}</th>
              <th>{__("Unit price")}</th>
              <th>{__("Ending Date")}</th>
              {action === "UPDATE" ? <th>{__("Update Status")}</th> : <></>}
              {action === "MATCH" ? <th>{__("Matched Status")}</th> : <></>}
              {action === "CREATE" ? <th>{__("Create Status")}</th> : <></>}
              {action === "DELETE" ? <th>{__("Delete Status")}</th> : <></>}
              {action === "ERROR" ? <th>{__("Error Status")}</th> : <></>}
            </tr>
          </thead>
          <tbody>{renderRow(data, action)}</tbody>
        </Table>
      </>
    );
  };

  const content = (
    <>
      {header}
      <br />
      <CollapseContent
        title={__(
          "Update product price" +
            (items.update ? ":  " + items.update.count : "")
        )}
      >
        <>
          <DataWithLoader
            data={
              items.update ? renderTable(items.update?.items, "UPDATE") : []
            }
            loading={false}
            emptyText={"Please check first."}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.update?.count || 0} />
        </>
      </CollapseContent>

      <CollapseContent
        title={__(
          "Matched product price" +
            (items.match ? ":  " + items.match.count : "")
        )}
      >
        <>
          <DataWithLoader
            data={items.update ? renderTable(items.match?.items, "MATCH") : []}
            loading={false}
            emptyText={"Please check first."}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.match?.count || 0} />
        </>
      </CollapseContent>

      <CollapseContent
        title={__(
          "Not created product" +
            (items.create ? ":  " + items.create.count : "")
        )}
      >
        <>
          <DataWithLoader
            data={
              items.create ? renderTable(items.create?.items, "CREATE") : []
            }
            loading={false}
            emptyText={"Please check first."}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.create?.count || 0} />
        </>
      </CollapseContent>

      <CollapseContent
        title={__(
          "Unmatched product" + (items.delete ? ":  " + items.delete.count : "")
        )}
      >
        <>
          <DataWithLoader
            data={
              items.delete ? renderTable(items.delete?.items, "DELETE") : []
            }
            loading={false}
            emptyText={"Please check first."}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.delete?.count || 0} />
        </>
      </CollapseContent>

      <CollapseContent
        title={__(
          "Error product" + (items.error ? ":  " + items.error.count : "")
        )}
      >
        <>
          <DataWithLoader
            data={items.delete ? renderTable(items.error?.items, "ERROR") : []}
            loading={false}
            emptyText={"Please check first."}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.error?.count || 0} />
        </>
      </CollapseContent>
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Check product price")}
          queryParams={queryParams}
          submenu={menuDynamic}
        />
      }
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={1}
          emptyImage="/images/actions/1.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default InventoryPrice;
