import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { Table, Icon } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { Sidebar } from './';

const propTypes = {
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  currentType: PropTypes.string,
  loading: PropTypes.bool
};

class Properties extends Component {
  constructor(props) {
    super(props);
  }

  renderProperties() {
    return (
      <ul>
        <li>
          ABOUT
          <Collapse in={true}>
            <div>
              <Table whiteSpace="nowrap" hover bordered>
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Last update</th>
                    <th>Name</th>
                    <th>Show</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>asd</td>
                    <td>asd</td>
                    <td>asd</td>
                    <td>asd</td>
                    <td>
                      <Icon icon="close" />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Collapse>
        </li>
        <li>
          ABOUT
          <Collapse in={true}>
            <div>
              <Table whiteSpace="nowrap" hover bordered>
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Last update</th>
                    <th>Name</th>
                    <th>Show</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>asd</td>
                    <td>asd</td>
                    <td>asd</td>
                    <td>asd</td>
                    <td>
                      <Icon icon="close" />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Collapse>
        </li>
      </ul>
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
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.renderProperties()}
      />
    );
  }
}

Properties.propTypes = propTypes;

export default Properties;
