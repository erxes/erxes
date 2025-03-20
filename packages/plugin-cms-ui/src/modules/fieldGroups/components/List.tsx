import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { queries } from '../graphql';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import SortableList from '@erxes/ui/src/components/SortableList';

import { menu } from '../../../routes';
import { EmptyState, EmptyText, EmptyTitle } from '../../../styles';
import { IWebSite } from '../../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { WEB_DETAIL } from '../../web/queries';
import { PropertyList } from '@erxes/ui-forms/src/settings/properties/styles';
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
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    // Handle reorder logic here
    // You'll need to update the order both for groups and fields
  };

  if (loading || webLoading) {
    return <Spinner />;
  }

  if (data.cmsCustomFieldGroups.length === 0) {
    return (
      <EmptyState>
        <EmptyTitle>{__('No field groups')}</EmptyTitle>
        <EmptyText>{__('Add a new field group')}</EmptyText>
        <Button onClick={() => setShowGroupModal(true)}>
          {__('Add field group')}
        </Button>
      </EmptyState>
    );
  }

  const renderRow = (group) => {
    return (
      <FieldRow
        key={group._id}
        group={group}
        groupsWithParents={[]}
        queryParams={{}}
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
