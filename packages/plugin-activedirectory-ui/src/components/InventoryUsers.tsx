import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Wrapper } from '@erxes/ui/src/layout';
import {
  CollapseContent,
  DataWithLoader,
  Pagination,
  Table,
} from '@erxes/ui/src/components';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import Row from './InventoryUsersRow';

type Props = {
  queryParams: any;
  loading: boolean;
  toCheckUsers: () => void;
  toSyncUsers: (action: string, users: any[]) => void;
  items: any;
};

const InventoryUsers = ({
  items,
  loading,
  queryParams,
  toCheckUsers,
  toSyncUsers,
}: Props) => {
  const checkButton = (
    <BarItems>
      <span>{items && items.matched && `Matched: ${items.matched.count}`}</span>

      <Button
        btnStyle="warning"
        size="small"
        icon="check-1"
        onClick={toCheckUsers}
      >
        check
      </Button>
    </BarItems>
  );

  const header = <Wrapper.ActionBar right={checkButton} />;
  const calculatePagination = (data: any) => {
    if (Object.keys(queryParams).length !== 0) {
      if (queryParams.page !== undefined && queryParams.page === undefined) {
        data = data.slice(queryParams.page * 0, queryParams.page * 1);
      } else {
        data = data.slice(
          (queryParams.page - 1) * 20,
          (queryParams.page - 1) * 20 + 20
        );
      }
    } else {
      data = data.slice(0, 20);
    }

    return data;
  };

  const renderTable = (data: any, action: string) => {
    data = calculatePagination(data);

    const excludeSyncTrue = (syncData: any) => {
      return syncData.filter((d) => d.syncStatus === false);
    };

    const onClickSync = () => {
      data = excludeSyncTrue(data);

      toSyncUsers(action, data);
    };

    const renderRow = (rowData: any, rowSction: string) => {
      if (rowData.length > 100) {
        rowData = rowData.slice(0, 100);
      }

      return rowData.map((p) => (
        <Row key={p.code} user={p} action={rowSction} />
      ));
    };

    const syncButton = (
      <Button
        btnStyle="primary"
        size="small"
        icon="check-1"
        onClick={onClickSync}
      >
        Sync
      </Button>
    );

    const subHeader = <Wrapper.ActionBar right={syncButton} />;
    return (
      <>
        {subHeader}
        <Table $hover={true}>
          <thead>
            <tr>
              <th>{__('User Name')}</th>
              <th>{__('First Name')}</th>
              <th>{__('Last Name')}</th>
              {action === 'UPDATE' ? <th>{__('Update Status')}</th> : <></>}
              {action === 'CREATE' ? <th>{__('Create Status')}</th> : <></>}
              {action === 'INACTIVE' ? <th>{__('INACTIVE Status')}</th> : <></>}
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
          'Create users' + (items.create ? ':  ' + items.create.count : '')
        )}
      >
        <>
          <DataWithLoader
            data={
              items.create ? renderTable(items.create?.items, 'CREATE') : []
            }
            loading={false}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.create?.count || 0} />
        </>
      </CollapseContent>
      <CollapseContent
        title={__(
          'Update users' + (items.update ? ':  ' + items.update.count : '')
        )}
      >
        <>
          <DataWithLoader
            data={
              items.update ? renderTable(items.update?.items, 'UPDATE') : []
            }
            loading={false}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.update?.count || 0} />
        </>
      </CollapseContent>
      <CollapseContent
        title={__(
          'Inactive users' +
            (items.inactive ? ':  ' + items.inactive.count : '')
        )}
      >
        <>
          <DataWithLoader
            data={
              items.inactive
                ? renderTable(items.inactive?.items, 'INACTIVE')
                : []
            }
            loading={false}
            emptyText={'Please check first.'}
            emptyIcon="leaf"
            size="large"
            objective={true}
          />
          <Pagination count={items.inactive?.count || 0} />
        </>
      </CollapseContent>
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Check user')}
          breadcrumb={[{ title: 'Active Directory' }]}
          queryParams={queryParams}
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

export default InventoryUsers;
