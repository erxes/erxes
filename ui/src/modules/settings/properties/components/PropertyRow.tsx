import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import Toggle from 'modules/common/components/Toggle';
import { __, Alert, confirm } from 'modules/common/utils';
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import PropertyForm from '../containers/PropertyForm';
import PropertyGroupForm from '../containers/PropertyGroupForm';
import { CollapseRow, DropIcon, FieldType } from '../styles';
import { IField, IFieldGroup } from '../types';

type Props = {
  group: IFieldGroup;
  queryParams: any;
  removePropertyGroup: (data: { _id: string }) => any;
  removeProperty: (data: { _id: string }) => void;
  updatePropertyVisible: (params: { _id: string; isVisible: boolean }) => void;
};

type State = {
  collapse: boolean;
};

class PropertyRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapse: true
    };
  }

  handleCollapse = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  visibleHandler = (e, property) => {
    if (property.isDefinedByErxes) {
      return Alert.error('You cannot update this property');
    }

    const isVisible = e.target.checked;

    return this.props.updatePropertyVisible({ _id: property._id, isVisible });
  };

  renderActionButtons = (data, remove, content) => {
    if (data.isDefinedByErxes) {
      return null;
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
          title="Edit Property"
          trigger={<Button btnStyle="link" icon="edit-3" />}
          content={content}
        />
        <Button btnStyle="link" icon="times-circle" onClick={onClick} />
      </ActionButtons>
    );
  };

  renderTableRow = (field: IField) => {
    const { removeProperty, queryParams } = this.props;
    const { lastUpdatedUser } = field;

    const onChange = e => this.visibleHandler(e, field);

    return (
      <tr key={field._id}>
        <td>
          {field.text}
          <FieldType>{field.type}</FieldType>
        </td>
        <td>
          {lastUpdatedUser && lastUpdatedUser.details
            ? lastUpdatedUser.details.fullName
            : 'Unknown'}
        </td>
        <td>
          <Toggle
            defaultChecked={field.isVisible}
            disabled={field.isDefinedByErxes}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={onChange}
          />
        </td>
        <td>
          {this.renderActionButtons(field, removeProperty, props => (
            <PropertyForm {...props} field={field} queryParams={queryParams} />
          ))}
        </td>
      </tr>
    );
  };

  renderTable = fields => {
    if (fields.length === 0) {
      return (
        <EmptyState
          icon="circular"
          text="There arent't any fields in this group"
        />
      );
    }

    return (
      <Table hover={true}>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Last Updated By')}</th>
            <th>{__('Visible')}</th>
            <th />
          </tr>
        </thead>
        <tbody>{fields.map(field => this.renderTableRow(field))}</tbody>
      </Table>
    );
  };

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const { fields = [] } = group;

    return (
      <li key={group._id}>
        <CollapseRow>
          <div style={{ flex: 1 }} onClick={this.handleCollapse}>
            <DropIcon isOpen={this.state.collapse} />
            {group.name} <span>{group.description}</span>
          </div>
          {this.renderActionButtons(group, removePropertyGroup, props => (
            <PropertyGroupForm
              {...props}
              group={group}
              queryParams={queryParams}
            />
          ))}
        </CollapseRow>
        <Collapse in={this.state.collapse}>
          <div>{this.renderTable(fields)}</div>
        </Collapse>
      </li>
    );
  }
}

export default PropertyRow;
