import { useQuery } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import SortableList from '@erxes/ui/src/components/SortableList';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import { queries } from '../graphql';

import { PropertyList } from '@erxes/ui-forms/src/settings/properties/styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import { menu } from '../../../routes';
import { EmptyState, EmptyText, EmptyTitle } from '../../../styles';
import { WEB_DETAIL } from '../../web/queries';
import FieldRow from './FieldRow';
import GroupForm from './GroupForm';

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
        updateGroupOrder={(e) => console.log(e)}
        removePropertyGroup={(e) => console.log(e)}
        removeProperty={(e) => console.log(e)}
        updateFieldOrder={(e) => console.log(e)}
      />
    );
  };

  const renderContent = () => {
    return (
      <PropertyList>
        <SortableList
          fields={data.cmsCustomFieldGroups || []}
          child={(group) => renderRow(group)}
          onChangeFields={(e) => {
            console.log(e);
          }}
          isModal={true}
          showDragHandler={false}
          droppableId='property-group'
        />
      </PropertyList>
    );
  };

  const trigger = (
    <Button btnStyle='success' size='small' icon='plus-circle'>
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

  if (data.cmsCustomFieldGroups.length === 0) {
    return (
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
    );
  }

  const righActionBar = (
    <BarItems>
      <ModalTrigger
        size='sm'
        title='Add Group'
        autoOpenKey='showAppAddModal'
        trigger={trigger}
        content={formContent}
      />
    </BarItems>
  );

  const breadcrumb = [
    { title: webData?.clientPortalGetConfig?.name, link: '/cms' },
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
            title={__('Category')}
            // queryParams={queryParams}
            breadcrumb={breadcrumb}
          />
        }
        hasBorder
        actionBar={actionBar}
        // footer={<Pagination count={totalCount} />}
        content={renderContent()}
      />
    </>
  );
};

export default FieldGroupsList;
