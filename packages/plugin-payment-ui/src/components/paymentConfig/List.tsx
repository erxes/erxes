import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import ConfigForm from '../../containers/paymentConfig/Form';
import { getSubMenu } from '../../containers/utils';
import { IPaymentConfig } from '../../types';
import Row from './Row';

type Props = {
  configs: IPaymentConfig[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (_id: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, configs, remove } = props;

  const renderRow = () => {
    return configs.map(config => (
      <Row key={config._id} config={config} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add config
    </Button>
  );

  const formContent = formProps => (
    <ConfigForm {...formProps} excludeIds={configs.map(c => c.contentTypeId)} />
  );

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="Config"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = <Wrapper.ActionBar right={righActionBar} />;

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Type')}</th>
          <th>{__('Name')}</th>
          <th>{__('Payments')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Configs')}
          queryParams={queryParams}
          submenu={getSubMenu()}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={configs.length}
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
