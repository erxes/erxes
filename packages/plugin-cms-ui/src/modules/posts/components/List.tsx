import Button from '@erxes/ui/src/components/Button';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, Contents } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { menu } from '../../../routes';
import { EmptyState, EmptyText, EmptyTitle } from '../../../styles';
import { IWebSite } from '../../../types';
import PostForm from '../containers/Form';
import LeftSidebar from './LeftSidebar';
import Row from './Row';

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
    <Button btnStyle='primary' size='small' icon='plus-circle'>
      Add post
    </Button>
  );

  const formContent = (formProps) => <PostForm {...formProps} />;

  const righActionBar = (
    <BarItems>
      <Button
        btnStyle='primary'
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

  const renderContent = () => {
    return (
      <Contents $hasBorder={true}>
        {/* Left Sidebar */}
        <LeftSidebar
          // Pass any required props to LeftSidebar component
          clientPortalId={clientPortalId}
          onChange={(field, value) => {
            navigate({
              pathname: location.pathname,
              search: `?${field}=${value}`,
            });
          }}
        />

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {posts.length === 0 ? (
            <EmptyState>
              <EmptyTitle>{__('No posts found')}</EmptyTitle>
              <EmptyText>{__('No posts found')}</EmptyText>
            </EmptyState>
          ) : (
            <Table $hover={true} $bordered={true} $striped={true}>
              <thead>
                <tr>
                  <th>{__('Title')}</th>
                  <th>{__('Type')}</th>
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
          )}
        </div>
      </Contents>
    );
  };

  const breadcrumb = [
    { title: 'Websites', link: '/cms' },
    { title: props.website?.name, link: '/cms/website/' + clientPortalId + '/posts' },
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
        content={renderContent()}
      />
    </>
  );
};

export default List;
