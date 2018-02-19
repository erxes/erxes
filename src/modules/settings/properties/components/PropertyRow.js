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
import { PropertyGroupForm } from '../containers';
import { ActionButtons } from '../styles';

const propTypes = {
  group: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired
};

class PropertyRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: false
    };

    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse() {
    this.setState({ collapse: !this.state.collapse });
  }

  renderTable(fields) {
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
                <td>Erxes</td>
                <td>
                  <Toggle
                    checked={true}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                    onChange={() => {
                      return null;
                    }}
                  />
                </td>
                <td>
                  <Icon icon="edit" />
                  <Icon icon="close" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    const { group, remove, queryParams } = this.props;
    const fields = group.getFields || [];

    return (
      <li key={group._id} onClick={this.handleCollapse}>
        <Icon icon="chevron-right" />
        {group.name}
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
                remove({ _id: group._id });
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
