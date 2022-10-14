import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled, __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import ConfigForm from '../../containers/paymentConfig/Form';
import { IPaymentConfig } from '../../types';
import { subMenu } from '../PaymentHome';

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

  if (isEnabled('products') && isEnabled('inbox')) {
    subMenu.push({
      title: 'Lead Integration Configs',
      link: '/payment/configs'
    });
  }

  const renderRow = () => {
    const { configs } = props;
    return configs.map(config => (
      <Row key={config._id} config={config} remove={remove} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add config
    </Button>
  );

  const formContent = props => (
    <ConfigForm {...props} excludeIds={configs.map(c => c.contentTypeId)} />
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

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={actionBarLeft} />
  );

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
          submenu={subMenu}
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
