import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import Toggle from 'react-toggle';
import {
  Table,
  Icon,
  ModalTrigger,
  EmptyState
} from 'modules/common/components';
import { confirm, Alert } from 'modules/common/utils';
import { PropertyGroupForm, PropertyForm } from '../containers';
import { DropIcon, FieldType } from '../styles';
import { ActionButtons, CollapseRow, TableRow } from '../../styles';

const propTypes = {
  group: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  removeProperty: PropTypes.func.isRequired,
  removePropertyGroup: PropTypes.func.isRequired,
  updatePropertyVisible: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class PropertyRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: true
    };

    this.renderTable = this.renderTable.bind(this);
    this.renderTableRow = this.renderTableRow.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.visibleHandler = this.visibleHandler.bind(this);
  }

  handleCollapse() {
    this.setState({ collapse: !this.state.collapse });
  }

  visibleHandler(e, property) {
    const { __ } = this.context;

    if (property.isDefinedByErxes) {
      return Alert.error(__('You cannot update this property'));
    }

    const isVisible = e.target.checked;

    return this.props.updatePropertyVisible({ _id: property._id, isVisible });
  }

  renderActionButtons(data, remove, form) {
    if (data.isDefinedByErxes) return null;

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit Property"
          trigger={<Icon icon="edit" />}
          size="lg"
        >
          {form}
        </ModalTrigger>
        <Icon
          icon="cancel-1"
          onClick={() =>
            confirm().then(() => {
              remove({ _id: data._id });
            })
          }
        />
      </ActionButtons>
    );
  }

  renderTableRow(field) {
    const { removeProperty, queryParams } = this.props;

    return (
      <TableRow key={field._id}>
        <td width="40%">
          {field.text}
          <FieldType>{field.type}</FieldType>
        </td>
        <td width="40%">
          {field.lastUpdatedUser
            ? field.lastUpdatedUser.details.fullName
            : 'Unknown'}
        </td>
        <td width="10%">
          <Toggle
            defaultChecked={field.isVisible}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={e => this.visibleHandler(e, field)}
          />
        </td>
        <td width="10%">
          {this.renderActionButtons(
            field,
            removeProperty,
            <PropertyForm field={field} queryParams={queryParams} />
          )}
        </td>
      </TableRow>
    );
  }

  renderTable(fields) {
    const { __ } = this.context;
    if (fields.length === 0) {
      return (
        <EmptyState
          icon="circular"
          text="There arent't any fields in this group"
        />
      );
    }

    return (
      <Table hover>
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
  }

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const { fields = [] } = group;

    return (
      <li key={group._id}>
        <CollapseRow>
          <DropIcon
            isOpen={this.state.collapse}
            onClick={this.handleCollapse}
          />
          <span onClick={this.handleCollapse}>{group.name}</span>
          {this.renderActionButtons(
            group,
            removePropertyGroup,
            <PropertyGroupForm group={group} queryParams={queryParams} />
          )}
        </CollapseRow>

        <Collapse in={this.state.collapse}>
          <div>{this.renderTable(fields)}</div>
        </Collapse>
      </li>
    );
  }
}

PropertyRow.propTypes = propTypes;
PropertyRow.contextTypes = contextTypes;

export default PropertyRow;
