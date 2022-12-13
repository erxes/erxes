import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { submenu } from '../../../utils';

import QuarterForm from '../containers/Form';
import Sidebar from './Sidebar';
import { IQuarter } from '../types';
import Row from './Row';

type Props = {
  quarters: IQuarter[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (quarterId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, quarters, remove } = props;

  const renderRow = () => {
    const { quarters } = props;
    return quarters.map(quarter => (
      <Row key={quarter._id} quarter={quarter} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add quarter
    </Button>
  );

  const formContent = props => <QuarterForm {...props} />;

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="quarter"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={actionBarLeft} />
  );

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('code')}</th>
          <th>{__('name')}</th>
          <th>{__('Latitude')}</th>
          <th>{__('Longitude')}</th>
          <th>{__('city')}</th>
          <th>{__('district')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Quarters')}
          queryParams={queryParams}
          submenu={submenu}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={<Sidebar loadingMainQuery={loading} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={quarters.length}
          emptyContent={
            <h3
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              no data
            </h3>
          }
        />
      }
    />
  );
};

export default List;
