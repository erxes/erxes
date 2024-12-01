import { DataWithLoader, Pagination, Table, Wrapper } from '@erxes/ui/src';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const CarsList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { queryParams } = props;

  const renderContent = () => {
    return (
      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th>{'active director'}</th>
          </tr>
        </thead>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`active director`)}
          queryParams={queryParams}
        />
      }
      footer={<Pagination count={0} />}
      hasBorder={true}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={false}
          count={0}
          emptyText={__('Add in your first car!')}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default CarsList;
