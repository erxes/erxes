import {
  Button,
  DataWithLoader,
  EmptyContent,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from '@erxes/ui/src';

import { IBmsBranch } from '../types';
import { Link } from 'react-router-dom';
import React from 'react';
import Row from './RowPos';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  branchList: IBmsBranch[];
  bulk: IBmsBranch[]; //*checkType
  isAllSelected: boolean;
  emptyBulk: () => void;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: IBmsBranch, toAdd: boolean) => void; //*checkType
  toggleAll: (bulk: IBmsBranch[], name: string) => void; //*checkType
  loading: boolean;
  totalCount: number;
  remove: (posId: string) => void;
  refetch?: () => void;
  counts: any; //*checkType
};

const List = (props: Props) => {
  const {
    branchList,
    queryParams,
    loading,
    totalCount,
    remove,
    bulk,
    toggleBulk,
    toggleAll,
  } = props;

  queryParams.loadingMainQuery = loading;

  const onChange = () => {
    toggleAll(branchList, 'posList');
  };

  const renderRow = () => {
    return branchList.map(branch => (
      <Row
        key={branch._id}
        isChecked={bulk.includes(branch)}
        toggleBulk={toggleBulk}
        branch={branch}
        remove={remove}
      />
    ));
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__('Tms')}</Title>;

    const actionBarRight = (
      <Link to={`/tms/create`}>
        <Button btnStyle='success' icon='plus-circle'>
          Create Branch
        </Button>
      </Link>
    );

    return (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background='colorWhite'
      />
    );
  };

  const renderContent = () => {
    return (
      <Table $whiteSpace='nowrap' $hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
            </th>
            <th>{__('Created by')}</th>
            <th>
              <SortHandler sortField={'createdDate'} label={__('Created at')} />
            </th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Tms')}
          breadcrumb={[
            { title: 'Settings', link: '/settings' },
            { title: __('Branch list') },
          ]}
          queryParams={queryParams}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyContent={
            <EmptyContent
              content={{
                title: __('Getting Started with erxes TMS'),
                description: __('replace description text'),
                steps: [
                  {
                    title: __('Create branch'),
                    description: __('Fill out the details and create your TMS'),
                    url: `/tms/create`,
                    urlText: 'Create TMS',
                  },
                ],
              }}
              maxItemWidth='360px'
            />
          }
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
