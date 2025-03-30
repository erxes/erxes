import {
  CollapseRow,
  DropIcon,
  PropertyListTable,
  PropertyTableHeader,
  PropertyTableRow,
  RowField,
} from '@erxes/ui-forms/src/settings/properties/styles';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Collapse from '@erxes/ui/src/components/Collapse';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import SortableList from '@erxes/ui/src/components/SortableList';
import Tip from '@erxes/ui/src/components/Tip';
import { IField } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import FieldForm from './FieldForm';
import GroupForm from './GroupForm';

type Props = {
  clientPortalId: string;
  group: any;
  groups: any[];
  groupsWithParents: any[];
  queryParams: any;
  removePropertyGroup: (data: { _id: string }) => any;
  removeProperty: (data: { _id: string }) => void;
  updateFieldOrder?: (fields: IField[]) => any;
  updateGroupOrder?: (groups: IFieldGroup[]) => void;
  refetch?: () => void;
};

const PropertyRow: React.FC<Props> = ({
  group,
  groups,
  groupsWithParents: initialGroupsWithParents,
  queryParams,
  clientPortalId,
  removePropertyGroup,
  removeProperty,
  updateFieldOrder,
  updateGroupOrder,
  refetch,
}) => {
  const [collapse, setCollapse] = useState(!group.parentId);
  const [fields, setFields] = useState(group.fields || []);
  const [groupsWithParents, setGroupsWithParents] = useState(
    initialGroupsWithParents
  );

  useEffect(() => {
    setFields(group.fields || []);
  }, [group.fields]);

  useEffect(() => {
    setGroupsWithParents(initialGroupsWithParents);
  }, [initialGroupsWithParents]);

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  const onChangeFields = (newFields: IField[]) => {
    setFields(newFields);
    if (updateFieldOrder) {
      updateFieldOrder(newFields);
    }
  };

  const renderActionButtons = (data: any, remove: any, isGroup: boolean) => {
    const onClick = () =>
      confirm()
        .then(() => {
          remove({ _id: data._id });
        })
        .catch((e) => {
          Alert.error(e.message);
        });

    const formContent = (formProps) => (
      <GroupForm
        {...formProps}
        group={group}
        clientPortalId={clientPortalId}
        refetch={refetch}
        groups={groups}
      />
    );

    const fieldEditFormContent = (formProps) => (
      <FieldForm
        {...formProps}
        field={data}
        groups={groups}
        groupId={group._id}
        refetch={refetch}
      />
    );
    const fieldFormContent = (formProps) => (
      <FieldForm
        {...formProps}
        groups={groups}
        groupId={group._id}
        refetch={refetch}
      />
    );

    return (
      <ActionButtons>
        {isGroup && (
          <Tip text={__('Add field')} placement='bottom'>
            <ModalTrigger
              size='sm'
              title={'Add field'}
              trigger={<Button btnStyle='link' icon='plus-circle' />}
              content={fieldFormContent}
            />
          </Tip>
        )}

        <Tip
          text={__(isGroup ? 'Edit group' : 'Edit field')}
          placement='bottom'
        >
          <ModalTrigger
            size={isGroup ? 'lg' : 'sm'}
            title={isGroup ? 'Edit group' : 'Edit field'}
            trigger={<Button btnStyle='link' icon='edit-3' />}
            content={isGroup ? formContent : fieldEditFormContent}
          />
        </Tip>
        <Tip
          text={__(isGroup ? 'Delete group' : 'Delete field')}
          placement='bottom'
        >
          <Button btnStyle='link' icon='times-circle' onClick={onClick} />
        </Tip>
      </ActionButtons>
    );
  };

  const renderTableRow = (field: IField) => {
    return (
      <PropertyTableRow key={field._id}>
        <RowField>{field.text}</RowField>
        <RowField>{field.code}</RowField>

        <RowField>{field.type}</RowField>
        <RowField>
          {renderActionButtons(
            field,
            removeProperty,

            false
          )}
        </RowField>
      </PropertyTableRow>
    );
  };

  const renderTable = (tableFields: IField[], contentType: string) => {
    if (tableFields.length === 0) {
      return (
        <EmptyState
          icon='circular'
          text="There aren't any fields in this group"
        />
      );
    }

    const renderListRow = (
      <SortableList
        fields={fields}
        child={renderTableRow}
        onChangeFields={onChangeFields}
        isModal={true}
        showDragHandler={false}
        droppableId='property fields'
      />
    );

    return (
      <PropertyListTable>
        <PropertyTableHeader>
          <ControlLabel>{__('Label')}</ControlLabel>
          <ControlLabel>{__('Key')}</ControlLabel>
          <ControlLabel>{__('Type')}</ControlLabel>

          <ControlLabel>{__('Actions')}</ControlLabel>
        </PropertyTableHeader>
        <div>{renderListRow}</div>
      </PropertyListTable>
    );
  };

  const renderChildGroupsTable = () => {
    const childGroups = groupsWithParents.filter(
      (item) => item.parentId === group._id
    );

    if (childGroups.length === 0) {
      return null;
    }

    const onChangeFieldGroups = (newGroupsWithParents: IFieldGroup[]) => {
      setGroupsWithParents(newGroupsWithParents);

      if (updateGroupOrder) {
        updateGroupOrder(newGroupsWithParents);
      }
    };

    const renderChildGroupRow = (childGroup: IFieldGroup) => {
      const fieldsGroupsWithParent = groupsWithParents.filter(
        (item) => item.parentId === childGroup._id
      );

      return (
        <PropertyRow
          key={childGroup._id}
          group={childGroup}
          groups={groups}
          clientPortalId={clientPortalId}
          groupsWithParents={fieldsGroupsWithParent}
          queryParams={queryParams}
          removePropertyGroup={removePropertyGroup}
          removeProperty={removeProperty}
          updateFieldOrder={updateFieldOrder}
          updateGroupOrder={updateGroupOrder}
        />
      );
    };

    return (
      <SortableList
        fields={childGroups}
        child={renderChildGroupRow}
        onChangeFields={onChangeFieldGroups}
        isModal={true}
        showDragHandler={false}
        droppableId='property-group'
      />
    );
  };

  return (
    <li key={group._id}>
      <CollapseRow $isChild={!!group.parentId}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} onClick={handleCollapse}>
            <DropIcon $isOpen={collapse} />
            {group.label}
          </div>

          <p style={{ fontSize: '12px', color: 'gray' }}>
            Types:(
            {group.customPostTypes.map((item: any) => item.label).join(', ')})
          </p>
        </div>
        {renderActionButtons(group, removePropertyGroup, true)}
      </CollapseRow>
      <Collapse show={collapse}>
        <div>
          {renderTable(fields, group.contentType)}
          {renderChildGroupsTable()}
        </div>
      </Collapse>
    </li>
  );
};

export default PropertyRow;
