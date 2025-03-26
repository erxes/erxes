import { useMutation, useQuery } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import SortableList from '@erxes/ui/src/components/SortableList';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, Contents } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import { mutations, queries } from './graphql';

import { PropertyList } from '@erxes/ui-forms/src/settings/properties/styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import { menu } from '../../routes';
import { EmptyState, EmptyText, EmptyTitle } from '../../styles';
import { WEB_DETAIL } from '../web/queries';
import FieldRow from './FieldRow';
import GroupForm from './GroupForm';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

const FieldGroupsList = () => {
  const { cpId = '' } = useParams<{ cpId: string }>();
  const { data, loading, refetch } = useQuery(queries.LIST, {
    variables: { clientPortalId: cpId },
  });

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  const [removeGroup] = useMutation(mutations.REMOVE);
  const [removeField] = useMutation(mutations.REMOVE_FIELD);

  if (loading || webLoading) {
    return <Spinner />;
  }

  const renderRow = (group) => {
    return (
      <FieldRow
        clientPortalId={cpId}
        key={group._id}
        group={group}
        groups={data.cmsCustomFieldGroups || []}
        groupsWithParents={[]}
        queryParams={{}}
        refetch={refetch}
     
        removePropertyGroup={() => {
          removeGroup({
            variables: {
              id: group._id,
            },
          }).then(() => {
            refetch();
          });
        }}
        removeProperty={(data) => {
          removeField({
            variables: {
              id: data._id,
            },
          }).then(() => {
            refetch();
          });
        }}
   
      />
    );
  };

  const renderContent = () => {
    return (
      <Contents $hasBorder={true}>
        <div style={{ flex: 1 }}>
          <PropertyList>
            <SortableList
              fields={data.cmsCustomFieldGroups || []}
              child={(group) => renderRow(group)}
              onChangeFields={(e) => {
                
              }}
              isModal={true}
              showDragHandler={false}
              droppableId='property-group'
            />
          </PropertyList>
        </div>
      </Contents>
    );
  };

  const trigger = (
    <Button btnStyle='primary' size='small' icon='plus-circle'>
      Add Field Group
    </Button>
  );

  const formContent = (formProps) => (
    <GroupForm
      {...formProps}
      clientPortalId={cpId}
      refetch={refetch}
      groups={data?.cmsCustomFieldGroups || []}
    />
  );

  const righActionBar = (
    <BarItems>
      <ModalTrigger
        size='lg'
        title='Add Group'
        autoOpenKey='showAppAddModal'
        trigger={trigger}
        content={formContent}
      />
    </BarItems>
  );

  const breadcrumb = [
    { title: 'Websites', link: '/cms' },
    {
      title: webData?.clientPortalGetConfig?.name,
      link: '/cms/website/' + cpId + '/custom-fields',
    },
    { title: __('Field Groups') },
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
            title={__('Field Groups')}
            // queryParams={queryParams}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={actionBar}
        // footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={renderContent()}
            loading={loading}
            count={data?.cmsCustomFieldGroups?.length || 0}
            emptyContent={
              <EmptyState>
                <EmptyTitle>{__('No field groups')}</EmptyTitle>
                <EmptyText>{__('Add a new field group')}</EmptyText>
                <ModalTrigger
                  size='sm'
                  title='Add Group'
                  autoOpenKey='showAppAddModal'
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

export default FieldGroupsList;
