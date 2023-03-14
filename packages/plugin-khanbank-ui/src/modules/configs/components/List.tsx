import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Form from '../containers/Form';

import { IKhanbankConfigsItem } from '../types';
import Row from './Row';

type Props = {
  configs: IKhanbankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (id: string) => void;
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

  const formContent = formProps => <Form {...formProps} />;

  const righActionBar = (
    <ModalTrigger
      size="sm"
      title="Corporate Gateway"
      autoOpenKey="showAppAddModal"
      trigger={trigger}
      content={formContent}
    />
  );

  const actionBar = <Wrapper.ActionBar right={righActionBar} />;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Khanbank'), link: '/settings/khanbank' }
  ];

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('name')}</th>
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
          title={__('Khanbank Corporate Gateway Configs')}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
          //   submenu={submenu}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/27.svg"
          title={'Khanbank Corporate Gateway'}
          description={__(
            `Corporate Gateway enables you access banking services through erxes.`
          )}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
          emptyContent={
            <EmptyContent
              content={{
                title: __('Getting Started with Khanbank Corporate Gateway'),
                steps: [
                  {
                    title: __('Create Corporate Gateway config'),
                    description: __(
                      'Register at Khanbank and become a Khanbank customer'
                    ),
                    url: `https://www.khanbank.com/en/corporate/product/429?activetab=2`,
                    urlText: 'Apply for Corporate Gateway',
                    isOutside: true,
                    target: '_blank'
                  }
                ]
              }}
              maxItemWidth="360px"
            />
          }
        />
      }
      hasBorder={true}
    />
  );
};

export default List;
