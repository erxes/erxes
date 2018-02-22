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
import { ActionButtons } from '../styles';

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

  visibleHandler(e, { property, group }) {
    const visible = e.target.checked;

    if (property) {
      return this.props.updatePropertyVisible({ _id: property._id, visible });
    }

    this.props.updatePropertyGroupVisible({ _id: group._id, visible });
  }

  renderTable(fields) {
    const { queryParams, removeProperty } = this.props;

    return (
      <Table whiteSpace="nowrap" hover bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Updated By</th>
            <th>Visible</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {fields.map(field => {
            return (
              <tr key={field._id}>
                <td>
                  {field.text} - {field.type}
                </td>
                <td>
                  {field.lastUpdatedBy
                    ? field.lastUpdatedBy.details.fullName
                    : 'Unknown'}
                </td>
                <td>
                  <Toggle
                    defaultChecked={field.visible}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                    onChange={e => this.visibleHandler(e, { property: field })}
                  />
                </td>
                <td>
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
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const fields = group.getFields || [];

    return (
      <li key={group._id}>
        <Icon icon="chevron-right" />
        <span onClick={this.handleCollapse}>{group.name}</span>
        <ActionButtons>
          <Toggle
            defaultChecked={group.visible}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={e => this.visibleHandler(e, { group: group })}
          />
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
