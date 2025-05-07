import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, Contents } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { EmptyState, EmptyText, EmptyTitle } from '../../../styles';
import TagForm from '../containers/Form';

import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import { menu } from '../../../routes';
import { IWebSite } from '../../../types';
import Row from './Row';

type Props = {
  website: IWebSite;
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

  const trigger = (
    <Button btnStyle='primary' size='small' icon='plus-circle'>
      Add tag
    </Button>
  );

  const formContent = (formProps) => (
    <TagForm
      {...formProps}
      clientPortalId={props.clientPortalId}
      refetch={props.refetch}
    />
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

  const breadcrumb = [
    { title: 'Websites', link: '/cms' },
    {
      title: props.website?.name,
      link: '/cms/website/' + props.clientPortalId + '/tags',
    },
    { title: __('Tags') },
  ];

  const leftActionBar = (
    <BarItems>
      <Submenu items={menu(props.clientPortalId)} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={leftActionBar} />
  );

  const content = (
    <Contents $hasBorder={true}>
      <div style={{ flex: 1 }}>
        <Table $hover={true} $bordered={true} $striped={true}>
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
      </div>
    </Contents>
  );
  return (
    <>
      <Wrapper
        transparent={false}
        header={
          <Wrapper.Header
            title={__('Tag')}
            queryParams={queryParams}
            breadcrumb={breadcrumb}
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
              <EmptyState>
                <EmptyTitle>No Tags Yet</EmptyTitle>
                <EmptyText>Create your first tag</EmptyText>
              </EmptyState>
            }
          />
        }
      />
    </>
  );
};

export default List;
