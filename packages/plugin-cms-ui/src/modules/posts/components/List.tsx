import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { menu } from '../../../routes';
import { IWebSite } from '../../../types';
import PostForm from '../containers/Form';
import Row from './Row';
import { EmptyState, EmptyText, EmptyTitle } from '../../../styles';

type Props = {
  website: IWebSite;
  clientPortalId: string;
  posts: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (productId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { clientPortalId } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const { totalCount, queryParams, loading, posts, remove } = props;

  const renderRow = () => {
    return posts.map((post) => (
      <Row key={post._id} post={post} remove={remove} />
    ));
  };

  //   queryParams.loadingMainQuery = loading;
  //   const actionBarLeft: React.ReactNode;

  const trigger = (
    <Button btnStyle='success' size='small' icon='plus-circle'>
      Add post
    </Button>
  );

  const formContent = (formProps) => <PostForm {...formProps} />;

  const righActionBar = (
    <BarItems>
      <Button
        btnStyle='success'
        size='small'
        icon='plus-circle'
        onClick={() => {
          navigate(`${location.pathname}/new`, { replace: true });
        }}
      >
        Add post
      </Button>
    </BarItems>
  );

  const leftActionBar = (
    <BarItems>
      <Submenu items={menu(clientPortalId)} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={leftActionBar} />
  );

  const content = (
    <Table $whiteSpace='nowrap' $hover={true}>
      <thead>
        <tr>
          <th>{__('Title')}</th>
          <th>{__('Categories')}</th>
          <th>{__('Tags')}</th>
          <th>{__('Status')}</th>
          <th>{__('Author')}</th>
          <th>{__('Created date')}</th>
          <th>{__('Last modified date')}</th>
          <th>{__('Last modified by')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const breadcrumb = [
    { title: props.website?.name, link: '/cms' },
    { title: __('Posts') },
  ];

  return (
    <>
      <Wrapper
        transparent={false}
        header={
          <Wrapper.Header
            title={__('Posts')}
            queryParams={queryParams}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        hasBorder
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={totalCount}
            emptyContent={
              <EmptyState>
                <EmptyTitle>No Posts Yet</EmptyTitle>
                <EmptyText>Create your first post</EmptyText>
              </EmptyState>
            }
          />
        }
      />
    </>
  );
};

export default List;
