import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { Table, Icon, ModalTrigger, Button } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { Sidebar } from './';

const propTypes = {
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  fieldsgroups: PropTypes.array,
  currentType: PropTypes.string,
  loading: PropTypes.bool
};

class Properties extends Component {
  constructor(props) {
    super(props);

    this.renderProperties = this.renderProperties.bind(this);
  }

  renderProperties() {
    const { fieldsgroups } = this.props;

    return (
      <ul>
        {fieldsgroups.map(group => {
          const fields = group.getFields || [];

          return (
            <li key={group._id}>
              {group.name}
              <Collapse in={true}>
                <div>
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
                </div>
              </Collapse>
            </li>
          );
        })}
      </ul>
    );
  }

  renderTrigger(text) {
    return (
      <Button btnStyle="success" size="small" icon="plus">
        {text}
      </Button>
    );
  }

  renderActionBar() {
    return (
      <div>
        <ModalTrigger
          title="Add Group"
          trigger={this.renderTrigger('Add Property Group')}
          size="lg"
        >
          <form />
        </ModalTrigger>
        <ModalTrigger
          title="Add Property"
          trigger={this.renderTrigger('Add Property')}
          size="lg"
        >
          <form />
        </ModalTrigger>
      </div>
    );
  }

  render() {
    const { currentType } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Properties', link: '/settings/properties' },
      { title: `${currentType}` }
    ];

    return (
      <Wrapper
        actionBar={<Wrapper.ActionBar right={this.renderActionBar()} />}
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.renderProperties()}
      />
    );
  }
}

Properties.propTypes = propTypes;

export default Properties;
