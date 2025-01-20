import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { BarItems } from '@erxes/ui/src/layout/styles';

import PostForm from '../containers/Form';
// import { tumentechMenu } from '../list/CarsList';

import { menu } from '../../../routes';
import Row from './Row';
import CPHeader from '../../clientportal/containers/Header';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  clientPortalId: string;
  posts: any[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  remove: (productId: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
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
          navigate(`/cms/posts/new?web=${props.clientPortalId}`, { replace: true });
        }}
      >
        Add post
      </Button>
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
  return (
    <>
      <Wrapper
        transparent={false}
        header={
          <Wrapper.Header
            title={__('Posts')}
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
            count={totalCount}
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
