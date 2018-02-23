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
import { confirm } from 'modules/common/utils';
import { PropertyGroupForm, PropertyForm } from '../containers';
import { DropIcon, FieldType } from '../styles';
import { ActionButtons, CollapseRow, TableRow } from '../../styles';

const propTypes = {
  group: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  removeProperty: PropTypes.func.isRequired,
  removePropertyGroup: PropTypes.func.isRequired,
  updatePropertyVisible: PropTypes.func.isRequired,
  updatePropertyGroupVisible: PropTypes.func.isRequired
};

class PropertyRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: true
    };

    this.renderTable = this.renderTable.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse() {
    this.setState({ collapse: !this.state.collapse });
  }

  visibleHandler(e, property) {
    const visible = e.target.checked;

    return this.props.updatePropertyVisible({ _id: property._id, visible });
  }

  renderTableRow(field) {
    const { queryParams, removeProperty } = this.props;
    const lastUpdate = field.lastUpdatedBy.details;

    return (
      <TableRow key={field._id}>
        <td width="40%">
          {field.text}
          <FieldType>{field.type}</FieldType>
        </td>
        <td width="40%">{lastUpdate.fullName}</td>
        <td width="10%">
          <Toggle
            defaultChecked={field.visible}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={e => this.visibleHandler(e, field)}
          />
        </td>
        <td width="10%">
          <ActionButtons>
            <ModalTrigger
              title="Edit Property"
              trigger={<Icon icon="edit" />}
              size="lg"
            >
              <PropertyForm field={field} queryParams={queryParams} />
            </ModalTrigger>
            <Icon
              icon="close"
              onClick={() =>
                confirm().then(() => {
                  removeProperty({ _id: field._id });
                })
              }
            />
          </ActionButtons>
        </td>
      </TableRow>
    );
  }

  renderTable(fields) {
    return (
      <Table hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Updated By</th>
            <th>Visible</th>
            <th />
          </tr>
        </thead>
        <tbody>{fields.map(field => this.renderTableRow(field))}</tbody>
      </Table>
    );
  }

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const fields = group.getFields || [];

    return (
      <li key={group._id}>
        <CollapseRow>
          <DropIcon
            isOpen={this.state.collapse}
            onClick={this.handleCollapse}
          />
          <span onClick={this.handleCollapse}>{group.name}</span>
          <ActionButtons>
            <ModalTrigger
              title="Edit group"
              trigger={<Icon icon="edit" />}
              size="lg"
            >
              <PropertyGroupForm group={group} queryParams={queryParams} />
            </ModalTrigger>
            <Icon
              icon="close"
              onClick={() =>
                confirm().then(() => {
                  removePropertyGroup({ _id: group._id });
                })
              }
            />
          </ActionButtons>
        </CollapseRow>

        <Collapse in={this.state.collapse}>
          <div>
            {fields.length === 0 ? (
              <EmptyState
                icon="android-more-horizontal"
                text="There arent't any fields in this group"
              />
            ) : (
              this.renderTable(fields)
            )}
          </div>
        </Collapse>
      </li>
    );
  }
}

PropertyRow.propTypes = propTypes;

export default PropertyRow;
