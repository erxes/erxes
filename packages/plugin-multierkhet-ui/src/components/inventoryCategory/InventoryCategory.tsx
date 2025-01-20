import { CollapseContent, Pagination } from '@erxes/ui/src/components';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState, useEffect } from 'react';
import Row from './InventoryCategoryRow';
import { menuMultierkhet } from '../../constants';
import { BarItems } from '@erxes/ui/src/layout/styles';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';

type Props = {
  loading: boolean;
  queryParams: any;
  toCheckCategories: () => void;
  toSyncCategories: (action: string, categories: any[]) => void;
  setBrand: (brandId: string) => void;
  items: any;
};

const InventoryCategory = (props: Props) => {
  const [openCollapse, setOpenCollapse] = useState(-1);
  const [loading, setLoading] = useState(false);
  const { queryParams, toSyncCategories, items } = props;

  useEffect(() => {
    setLoading(false);
  }, [openCollapse]);

  const renderRow = (data: any, action: string) => {
    return data.map((c) => <Row key={c.code} category={c} action={action} />);
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
      toSyncCategories(action, data);
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
        <Table $hover={true}>
          <thead>
            <tr>
              <th>{__('Code')}</th>
              <th>{__('Name')}</th>
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
    props.toCheckCategories();
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
        initialValue={props.queryParams.brandId}
        multi={false}
        name="selectedBrands"
        customOption={{
          label: 'No Brand (noBrand)',
          value: '',
        }}
      />

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
          'Create categories' +
            (items.create ? ':  ' + items.create.count : ''),
        )}
        id={'1'}
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
          'Update categories' +
            (items.update ? ':  ' + items.update.count : ''),
        )}
        id={'2'}
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
          'Delete categories' +
            (items.delete ? ':  ' + items.delete.count : ''),
        )}
        id={'3'}
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
          title={__(`Check category`)}
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

export default InventoryCategory;
