import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { BarItems } from '@erxes/ui/src/layout/styles';

import TagForm from '../containers/Form';
// import { tumentechMenu } from '../list/CarsList';

import { menu } from '../../../routes';
import Row from './Row';
import CPHeader from '../../clientportal/containers/Header';

type Props = {
  clientPortalId: string;
  tags: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (productId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, tags, remove } = props;

  const renderRow = () => {

    return tags.map((tag) => (
      <React.Fragment key={tag._id}>
        <Row tag={tag} remove={remove} />
      </React.Fragment>
    ));
  };

  //   queryParams.loadingMainQuery = loading;
  //   const actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle='success' size='small' icon='plus-circle'>
      Add tag
    </Button>
  );

  const formContent = (formProps) => (
    <TagForm {...formProps} clientPortalId={props.clientPortalId} refetch={props.refetch} />
  );

  const righActionBar = (
    <BarItems>
      <ModalTrigger
        size='lg'
        title='Add tag'
        autoOpenKey='showAppAddModal'
        trigger={trigger}
        content={formContent}
      />
    </BarItems>
  );

  const leftActionBar = (
    <BarItems>
      <CPHeader />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={leftActionBar} />
  );

  const content = (
    <Table $whiteSpace='nowrap' $hover={true}>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Slug')}</th>
          <th>{__('Last modified date')}</th>
          <th>{__('Last modified by')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <>
      <Wrapper
        transparent={false}
        header={
          <Wrapper.Header
            title={__('Tag')}
            queryParams={queryParams}
            submenu={menu}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={props.totalCount}
            emptyContent={
              <h3
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                no data
              </h3>
            }
          />
        }
      />
    </>
  );
};

export default List;
