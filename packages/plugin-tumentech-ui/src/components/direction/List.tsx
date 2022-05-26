import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import Row from './Row';

type Props = {
  directions: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (integrationId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, directions } = props;

  const renderRow = () => {
    const { directions } = props;
    return directions.map(direction => (
      <Row key={direction._id} direction={direction} />
    ));
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  const actionBarRight = (
    <Link to="/forms/create">
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add direction
      </Button>
    </Link>
  );
  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Created by')}</th>
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
          title={__('Directions')}
          breadcrumb={[
            {
              title: __('Directions')
            }
          ]}
          queryParams={queryParams}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={directions.length}
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
