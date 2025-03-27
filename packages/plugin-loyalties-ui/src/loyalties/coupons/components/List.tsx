import { Title } from '@erxes/ui-settings/src/styles';
import { getEnv } from '@erxes/ui/src';
import {
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { SimpleButton } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import queryString from 'query-string';
import React, { useState } from 'react';
import { menuLoyalties } from '../../common/constants';
import { COUPON_LIST_HEADERS } from '../constants';
import Form from '../containers/Form';
import { ICoupon } from '../types';
import Row from './Row';
import Sidebar from './Sidebar';

type Props = {
  queryParams: any;
  loading: boolean;
  list: ICoupon[];
  totalCount: number;
};

const List = (props: Props) => {
  const { queryParams, loading, list, totalCount } = props;

  const [toggleSidebar, setToggleSidebar] = useState<boolean>(true);

  const handleExport = () => {
    const { REACT_APP_API_URL } = getEnv();
    const params = queryParams || {};

    const stringified = queryString.stringify({
      ...params,
    });

    window.open(
      `${REACT_APP_API_URL}/pl:loyalties/file-export?${stringified}`,
      '_blank',
    );
  };

  const renderForm = (formProps) => {
    return <Form {...formProps} />;
  };

  const renderActions = () => {
    const formTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add coupon
      </Button>
    );

    const left = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SimpleButton
          id="btn-inbox-channel-visible"
          $isActive={toggleSidebar}
          onClick={() => setToggleSidebar(!toggleSidebar)}
        >
          <Icon icon="subject" />
        </SimpleButton>
        <Title>{`All Coupon List (${totalCount})`}</Title>
      </div>
    );

    const right = (
      <>
        <Button onClick={handleExport}>Export</Button>
        <ModalTrigger
          title={__('New Coupon')}
          trigger={formTrigger}
          autoOpenKey="showCouponModal"
          content={renderForm}
          backDrop="static"
        />
      </>
    );

    return <Wrapper.ActionBar left={left} right={right} />;
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            {COUPON_LIST_HEADERS.map((header) => (
              <th key={header.name}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <Row
              key={item._id}
              item={item}
              columnLength={COUPON_LIST_HEADERS.length}
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
          title={__(`Coupon`) + ` (${totalCount})`}
          submenu={menuLoyalties}
        />
      }
      actionBar={renderActions()}
      footer={<Pagination count={totalCount} />}
      leftSidebar={toggleSidebar && <Sidebar queryParams={queryParams} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      }
      hasBorder
    />
  );
};

export default List;
