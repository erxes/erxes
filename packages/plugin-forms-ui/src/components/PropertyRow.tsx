import PropertyForm from '@erxes/ui-forms/src/settings/properties/containers/PropertyForm';
import PropertyGroupForm from '@erxes/ui-forms/src/settings/properties/containers/PropertyGroupForm';
import {
  CollapseRow,
  DropIcon,
  FieldType,
  PropertyListTable,
  PropertyTableHeader,
  PropertyTableRow,
  RowField
} from '@erxes/ui-forms/src/settings/properties/styles';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import SortableList from '@erxes/ui/src/components/SortableList';
import Toggle from '@erxes/ui/src/components/Toggle';
import { IField } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';

type Props = {
  group: IFieldGroup;
  groupsWithParents: IFieldGroup[];
  queryParams: any;
  removePropertyGroup: (data: { _id: string }) => any;
  removeProperty: (data: { _id: string }) => void;
  updatePropertyVisible: (params: { _id: string; isVisible: boolean }) => void;
  updatePropertyDetailVisible: (params: {
    _id: string;
    isVisibleInDetail: boolean;
  }) => void;
  updatePropertySystemFields: (data: {
    _id: string;
    isVisibleToCreate?: boolean;
    isRequired?: boolean;
  }) => void;
  updateFieldOrder: (fields: IField[]) => any;
  updateGroupOrder: (groups: IFieldGroup[]) => void;
};

type State = {
  collapse: boolean;
  fields: IField[];
  groupsWithParents: IFieldGroup[];
};

class PropertyRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { groupsWithParents = [] } = props;
    const { fields = [] } = props.group;

    this.state = {
      collapse: props.group.parentId ? false : true,
      fields,
      groupsWithParents
    };
  }

  componentWillReceiveProps(nextProps) {
    const { groupsWithParents = [] } = this.props;
    const { fields = [] } = this.props.group;

    if (fields !== nextProps.group.fields) {
      this.setState({
        fields: nextProps.group.fields
      });
    }

    if (groupsWithParents !== nextProps.groupsWithParents) {
      this.setState({
        groupsWithParents: nextProps.groupsWithParents
      });
    }
  }

  handleCollapse = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  onChangeFields = fields => {
    this.setState({ fields }, () => {
      this.props.updateFieldOrder(this.state.fields);
    });
  };

  visibleHandler = (e, property) => {
    if (!property.canHide) {
      return Alert.error('You cannot update this property');
    }

    if (e.target.id === 'visibleDetailToggle') {
      const isVisibleInDetail = e.target.checked;

      return this.props.updatePropertyDetailVisible({
        _id: property._id,
        isVisibleInDetail
      });
    }

    const isVisible = e.target.checked;

    return this.props.updatePropertyVisible({ _id: property._id, isVisible });
  };

  updateSystemFieldsHandler = (e, property) => {
    return this.props.updatePropertySystemFields({
      _id: property._id,
      [e.target.id]: e.target.checked
    });
  };

  renderActionButtons = (data, remove, content, isGroup) => {
    if (data.isDefinedByErxes) {
      return null;
    }

    let size;

    if (isGroup) {
      const group: IFieldGroup = data;
      if (['task', 'ticket', 'deal', 'purchase'].includes(group.contentType)) {
        size = 'lg';
      }
    }

    const onClick = () =>
      confirm()
        .then(() => {
          remove({ _id: data._id });
        })
        .catch(e => {
          Alert.error(e.message);
        });

    return (
      <ActionButtons>
        <ModalTrigger
          title={isGroup ? 'Edit group' : 'Edit field'}
          trigger={<Button btnStyle="link" icon="edit-3" />}
          content={content}
          size={size}
        />
        <Button btnStyle="link" icon="times-circle" onClick={onClick} />
      </ActionButtons>
    );
  };

  renderTableRow = (field: IField) => {
    const { removeProperty, queryParams } = this.props;
    const { lastUpdatedUser, contentType } = field;

    const onChange = e => this.visibleHandler(e, field);

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

        {field.relationType ? (
          <RowField>
            <Toggle
              id="isVisibleToCreate"
              defaultChecked={field.isVisibleToCreate}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
              onChange={e => this.updateSystemFieldsHandler(e, field)}
            />
          </RowField>
        ) : (
          <>
            <RowField>
              <Toggle
                id="visibleToggle"
                defaultChecked={field.isVisible}
                disabled={!field.canHide}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
                onChange={onChange}
              />
            </RowField>
            {['visitor', 'lead', 'customer', 'device'].includes(
              (contentType || '').split(':')[1]
            ) && (
              <RowField>
                <Toggle
                  id="visibleDetailToggle"
                  defaultChecked={field.isVisibleInDetail}
                  disabled={!field.canHide}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>
                  }}
                  onChange={onChange}
                />
              </RowField>
            )}
          </>
        )}

        {contentType.startsWith('cards:') && !field.relationType && (
          <>
            <RowField>
              <Toggle
                id="isVisibleToCreate"
                defaultChecked={field.isVisibleToCreate}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
                onChange={e => this.updateSystemFieldsHandler(e, field)}
              />
            </RowField>
            <RowField>
              <Toggle
                id="isRequired"
                defaultChecked={field.isRequired}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
                onChange={e => this.updateSystemFieldsHandler(e, field)}
              />
            </RowField>
          </>
        )}
        <RowField>{hasLogic ? 'Yes' : 'No'}</RowField>

        <RowField>
          {this.renderActionButtons(
            field,
            removeProperty,
            props => (
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

  renderTable = (fields, contentType) => {
    if (fields.length === 0) {
      return (
        <EmptyState
          icon="circular"
          text="There aren't any fields in this group"
        />
      );
    }

    const child = field => this.renderTableRow(field);
    let showVisibleDetail = ['visitor', 'lead', 'customer', 'device'].includes(
      (contentType || '').split(':')[1]
    );

    let isRelation = false;

    if (
      this.props.group.isDefinedByErxes &&
      this.props.group.code === `${contentType}:relations`
    ) {
      showVisibleDetail = false;
      isRelation = true;
    }

    const renderListRow = (
      <SortableList
        fields={this.state.fields}
        child={child}
        onChangeFields={this.onChangeFields}
        isModal={true}
        showDragHandler={false}
        droppableId="property fields"
      />
    );

    return (
      <PropertyListTable>
        <PropertyTableHeader>
          <ControlLabel>{__('Name')}</ControlLabel>
          <ControlLabel>{__('Last Updated By')}</ControlLabel>
          {showVisibleDetail ? (
            <ControlLabel>{__('Visible in Team Inbox')}</ControlLabel>
          ) : isRelation ? (
            <ControlLabel>{__('Visible to create')}</ControlLabel>
          ) : (
            <ControlLabel>{__('Visible')}</ControlLabel>
          )}
          {contentType.startsWith('cards:') && !isRelation && (
            <>
              <ControlLabel>{__('Visible to create')}</ControlLabel>
              <ControlLabel>{__('Required')}</ControlLabel>
            </>
          )}
          {showVisibleDetail && (
            <ControlLabel>{__('Visible in detail')}</ControlLabel>
          )}

          <ControlLabel>{__('Has logic')}</ControlLabel>
          <ControlLabel>{__('Actions')}</ControlLabel>
        </PropertyTableHeader>
        <div>
          {this.props.group.isDefinedByErxes
            ? fields.map(field => this.renderTableRow(field))
            : renderListRow}
        </div>
      </PropertyListTable>
    );
  };

  renderChildGroupsTable = () => {
    const { group } = this.props;
    const { groupsWithParents } = this.state;

    const childGroups = groupsWithParents.filter(
      item => item.parentId === group._id
    );

    if (childGroups.length === 0) {
      return null;
    }

    const onChangeFieldGroups = groupsWithParents => {
      this.setState({ groupsWithParents }, () => {
        this.props.updateGroupOrder(this.state.groupsWithParents);
      });
    };

    const renderChildGroupRow = childGroup => {
      const {
        queryParams,
        removePropertyGroup,
        removeProperty,
        updatePropertyVisible,
        updatePropertyDetailVisible,
        updatePropertySystemFields,
        updateFieldOrder,
        updateGroupOrder
      } = this.props;

      const fieldsGroupsWithParent = groupsWithParents.filter(
        item => item.parentId === childGroup._id
      );

      return (
        <PropertyRow
          key={childGroup._id}
          group={childGroup}
          groupsWithParents={fieldsGroupsWithParent}
          queryParams={queryParams}
          removePropertyGroup={removePropertyGroup}
          removeProperty={removeProperty}
          updatePropertyVisible={updatePropertyVisible}
          updatePropertyDetailVisible={updatePropertyDetailVisible}
          updatePropertySystemFields={updatePropertySystemFields}
          updateFieldOrder={updateFieldOrder}
          updateGroupOrder={updateGroupOrder}
        />
      );
    };

    return (
      <SortableList
        fields={childGroups}
        child={group => renderChildGroupRow(group)}
        onChangeFields={onChangeFieldGroups}
        isModal={true}
        showDragHandler={false}
        droppableId="property-group"
      />
    );
  };

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const { fields = [] } = group;

    return (
      <li key={group._id}>
        <CollapseRow isChild={!!group.parentId}>
          <div style={{ flex: 1 }} onClick={this.handleCollapse}>
            <DropIcon isOpen={this.state.collapse} />
            {group.name}
          </div>
          {this.renderActionButtons(
            group,
            removePropertyGroup,
            props => (
              <PropertyGroupForm
                {...props}
                group={group}
                queryParams={queryParams}
              />
            ),
            true
          )}
        </CollapseRow>
        <Collapse in={this.state.collapse}>
          <div>
            {this.renderTable(fields, group.contentType)}
            {this.renderChildGroupsTable()}
          </div>
        </Collapse>
      </li>
    );
  }
}

export default PropertyRow;
