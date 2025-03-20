import PropertyForm from '@erxes/ui-forms/src/settings/properties/containers/PropertyForm';
import PropertyGroupForm from '@erxes/ui-forms/src/settings/properties/containers/PropertyGroupForm';
import {
  CollapseRow,
  DropIcon,
  FieldType,
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
import { IField } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import GroupForm from './GroupForm';
import FieldForm from './FieldForm';

type Props = {
  clientPortalId: string;
  group: any;
  groups: any[];
  groupsWithParents: any[];
  queryParams: any;
  removePropertyGroup: (data: { _id: string }) => any;
  removeProperty: (data: { _id: string }) => void;
  updateFieldOrder: (fields: IField[]) => any;
  updateGroupOrder: (groups: IFieldGroup[]) => void;
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
    updateFieldOrder(newFields);
  };

  const renderActionButtons = (
    data: any,
    remove: any,
    content: any,
    isGroup: boolean
  ) => {
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

    const fieldFormContent = (formProps) => (
      <FieldForm {...formProps} groups={groups} groupId={group._id} refetch={refetch} />
    );

    return (
      <ActionButtons>
        <Tip text={__('Add field')} placement='bottom'>
          <ModalTrigger
            size='sm'
            title={isGroup ? 'Edit group' : 'Edit field'}
            trigger={<Button btnStyle='link' icon='plus-circle' />}
            content={fieldFormContent}
          />
        </Tip>
        <Tip text={__('Edit group')} placement='bottom'>
          <ModalTrigger
            size='sm'
            title={isGroup ? 'Edit group' : 'Edit field'}
            trigger={<Button btnStyle='link' icon='edit-3' />}
            content={formContent}
          />
        </Tip>
        <Tip text={__('Delete group')} placement='bottom'>
          <Button btnStyle='link' icon='times-circle' onClick={onClick} />
        </Tip>
      </ActionButtons>
    );
  };

  const renderTableRow = (field: IField) => {
    const { lastUpdatedUser, contentType } = field;

    const hasLogic = field.logics && field.logics.length > 0;

    return (
      <PropertyTableRow key={field._id}>
        <RowField>
          {field.text}
          <FieldType>{field.type}</FieldType>
        </RowField>
        <RowField>
          {lastUpdatedUser && lastUpdatedUser.details
            ? lastUpdatedUser.details.fullName
            : 'Erxes'}
        </RowField>

        <RowField>{hasLogic ? 'Yes' : 'No'}</RowField>
        <RowField>
          {renderActionButtons(
            field,
            removeProperty,
            (props) => (
              <PropertyForm
                {...props}
                field={field}
                queryParams={queryParams}
              />
            ),
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
          <ControlLabel>{__('Name')}</ControlLabel>
          <ControlLabel>{__('Last Updated By')}</ControlLabel>
          <ControlLabel>{__('Has logic')}</ControlLabel>
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
      updateGroupOrder(newGroupsWithParents);
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
        <div style={{ flex: 1 }} onClick={handleCollapse}>
          <DropIcon $isOpen={collapse} />
          {group.label}
        </div>
        {renderActionButtons(
          group,
          removePropertyGroup,
          (props) => (
            <PropertyGroupForm
              {...props}
              group={group}
              queryParams={queryParams}
            />
          ),
          true
        )}
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
