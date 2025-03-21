import { useQuery, useMutation } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Spinner from '@erxes/ui/src/components/Spinner';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, Contents } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';

import { useParams } from 'react-router-dom';
import queries from './graphql/queries';
import { WEB_DETAIL } from '../web/queries';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { menu } from '../../routes';
import { EmptyState, EmptyText, EmptyTitle } from '../../styles';
import Row from './Row';
import CustomTypeForm from './CustomTypeForm';
import mutations from './graphql/mutations';

type Props = {};

const CustomPostTypes = (props: Props) => {
  const { cpId = '' } = useParams<{ cpId: string }>();
  const { data, loading, refetch } = useQuery(queries.LIST, {
    variables: { clientPortalId: cpId },
  });

  const [list, setList] = React.useState(
    data?.cmsCustomPostTypeList?.list || []
  );

  const [remove] = useMutation(mutations.REMOVE, {
    onCompleted: () => {
      refetch();
    },
  });

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  React.useEffect(() => {
    setList(data?.cmsCustomPostTypeList?.list || []);
  }, [data]);

  if (loading || webLoading) {
    return <Spinner />;
  }

  const renderRow = () => {
    return list.map((type) => (
      <React.Fragment key={type._id}>
        <Row
          cpId={cpId}
          refetch={refetch}
          postType={type}
          remove={(_id: string) => {
            remove({
              variables: {
                id: _id,
              },
            });
          }}
        />
      </React.Fragment>
    ));
  };

  const content = (
    <Contents $hasBorder={true}>
      <div style={{ flex: 1 }}>
        <Table $whiteSpace='nowrap' $hover={true}>
          <thead>
            <tr>
              <th>{__('Label')}</th>
              <th>{__('Description')}</th>
              <th>{__('Key')}</th>
              <th>{__('Created at')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </div>
    </Contents>
  );

  const trigger = (
    <Button btnStyle='primary' size='small' icon='plus-circle'>
      Add Type
    </Button>
  );

  const formContent = (formProps) => (
    <CustomTypeForm {...formProps} clientPortalId={cpId} refetch={refetch} />
  );

  const righActionBar = (
    <BarItems>
      <ModalTrigger
        size='sm'
        title='Add Type'
        autoOpenKey='showTypeAddModal'
        trigger={trigger}
        content={formContent}
      />
    </BarItems>
  );

  const breadcrumb = [
    { title: 'Websites', link: '/cms' },
    {
      title: webData?.clientPortalGetConfig?.name,
      link: '/cms/website/' + cpId + '/custom-post-types',
    },
    { title: __('Custom post types') },
  ];

  const leftActionBar = (
    <BarItems>
      <Submenu items={menu(cpId)} />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={leftActionBar} />
  );

  return (
    <>
      <Wrapper
        transparent={false}
        header={
          <Wrapper.Header
            title={__('Custom post types')}
            // queryParams={queryParams}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={actionBar}
        footer={
          <Pagination count={data?.cmsCustomPostTypeList?.totalCount || 0} />
        }
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={data?.cmsCustomPostTypeList?.totalCount}
            emptyContent={
              <EmptyState>
                <EmptyTitle>No Types Yet</EmptyTitle>
                <EmptyText>Create your first type</EmptyText>
                <ModalTrigger
                  size='sm'
                  title='Add Type'
                  autoOpenKey='showTypeAddModal'
                  trigger={trigger}
                  content={formContent}
                />
              </EmptyState>
            }
          />
        }
      />
    </>
  );
};

export default CustomPostTypes;
