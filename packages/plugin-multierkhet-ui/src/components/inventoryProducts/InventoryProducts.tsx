import React, { useState, useEffect } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import Table from '@erxes/ui/src/components/table';
import Button from '@erxes/ui/src/components/Button';
import Row from './InventoryProductsRow';
import {
  CollapseContent,
  DataWithLoader,
  Pagination,
} from '@erxes/ui/src/components';
import { menuMultierkhet } from '../../constants';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { BarItems } from '@erxes/ui/src/layout/styles';

type Props = {
  loading: boolean;
  queryParams: any;
  toCheckProducts: () => void;
  toSyncProducts: (action: string, products: any[]) => void;
  setBrand: (brandId: string) => void;
  items: any;
};

const InventoryProducts = (props: Props) => {
  const [openCollapse, setOpenCollapse] = useState(0);
  const [loading, setLoading] = useState(false);
  const { queryParams, items, toCheckProducts } = props;

  useEffect(() => {
    setLoading(false);
  }, [openCollapse]);

  const renderRow = (data: any, action: string) => {
    if (data.length > 100) {
      data = data.slice(0, 100);
    }
    return data.map((p) => <Row key={p.code} product={p} action={action} />);
  };

  const calculatePagination = (data: any) => {
    if (Object.keys(queryParams).length !== 0) {
      if (queryParams.perPage !== undefined && queryParams.page == undefined) {
        data = data.slice(queryParams.perPage * 0, queryParams.perPage * 1);
      }

      if (queryParams.page !== undefined) {
        if (queryParams.perPage !== undefined) {
          data = data.slice(
            Number(queryParams.page - 1) * queryParams.perPage,
            Number((queryParams.page - 1) * queryParams.perPage) +
              Number(queryParams.perPage),
          );
        } else {
          data = data.slice(
            (queryParams.page - 1) * 20,
            (queryParams.page - 1) * 20 + 20,
          );
        }
      }
    } else {
      data = data.slice(0, 20);
    }

    return data;
  };

  const excludeSyncTrue = (data: any) => {
    return data.filter((d) => d.syncStatus == false);
  };

  const renderTable = (data: any, action: string) => {
    data = calculatePagination(data);

    const onClickSync = () => {
      data = excludeSyncTrue(data);
      props.toSyncProducts(action, data);
    };
    const syncButton = (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="check-1"
          onClick={onClickSync}
        >
          Sync
        </Button>
      </>
    );

    const header = <Wrapper.ActionBar right={syncButton} />;
    return (
      <>
        {header}
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
              <th>{__('Barcode')}</th>
              <th>{__('Unit price')}</th>
              {action === 'UPDATE' ? <th>{__('Update Status')}</th> : <></>}
              {action === 'CREATE' ? <th>{__('Create Status')}</th> : <></>}
              {action === 'DELETE' ? <th>{__('Delete Status')}</th> : <></>}
            </tr>
          </thead>
          <tbody>{renderRow(data, action)}</tbody>
        </Table>
      </>
    );
  };

  const onClickCheck = () => {
    toCheckProducts();
  };

  const checkOpenCollapse = (num: number): boolean => {
    return openCollapse == num ? true : false;
  };

  const onChangeCollapse = (num: number): void => {
    if (num !== openCollapse) {
      setLoading(true);
      setOpenCollapse(num);
    }
  };

  const checkButton = (
    <BarItems>
      <SelectBrands
        label={__('Choose brands')}
        onSelect={(brand) => props.setBrand(brand as string)}
        initialValue={queryParams.brandId}
        multi={false}
        name="selectedBrands"
        customOption={{
          label: 'No Brand (noBrand)',
          value: '',
        }}
      />
      <span>
        {items &&
          items.matched &&
          items.matched.count &&
          `Matched: ${items.matched.count}`}
      </span>
      <Button
        btnStyle="warning"
        size="small"
        icon="check-1"
        onClick={onClickCheck}
      >
        Check
      </Button>
    </BarItems>
  );

  const header = <Wrapper.ActionBar right={checkButton} />;

  const content = (
    <>
      {header}
      <br />
      <CollapseContent
        title={__(
          'Create products' + (items.create ? ':  ' + items.create.count : ''),
        )}
        onClick={() => {
          onChangeCollapse(1);
        }}
        open={checkOpenCollapse(1)}
      >
        <>
          <DataWithLoader
            data={
              items.create ? renderTable(items.create?.items, 'CREATE') : []
            }
            loading={false}
            count={3}
            emptyText={__('Please check first.')}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.create?.count || 0} />
        </>
      </CollapseContent>
      <CollapseContent
        title={__(
          'Update products' + (items.update ? ':  ' + items.update.count : ''),
        )}
        onClick={() => {
          onChangeCollapse(2);
        }}
        open={checkOpenCollapse(2)}
      >
        <>
          <DataWithLoader
            data={items.update ? renderTable(items.update.items, 'UPDATE') : []}
            loading={false}
            emptyText={__('Please check first.')}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.update?.count || 0} />
        </>
      </CollapseContent>
      <CollapseContent
        title={__(
          'Delete products' + (items.delete ? ':  ' + items.delete.count : ''),
        )}
        onClick={() => {
          onChangeCollapse(3);
        }}
        open={checkOpenCollapse(3)}
      >
        <>
          <DataWithLoader
            data={items.delete ? renderTable(items.delete.items, 'DELETE') : []}
            loading={false}
            emptyText={__('Please check first.')}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.delete?.count || 0} />
        </>
      </CollapseContent>
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Check product`)}
          queryParams={props.queryParams}
          submenu={menuMultierkhet}
        />
      }
      content={
        <DataWithLoader data={content} loading={props.loading || loading} />
      }
      hasBorder
    />
  );
};

export default InventoryProducts;
