import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Label } from 'react-bootstrap';
import { Tip, ActionButtons, ModalTrigger } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar';
import { Config } from '../containers';

const propTypes = {
  brands: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired,
};

class List extends React.Component {
  renderRow(brand) {
    const { refetch } = this.props;
    const { name, _id } = brand;
    const emailConfig = brand.emailConfig || { type: 'simple' };

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit">
          <i className="ion-edit" />
        </Tip>
      </Button>
    );

    const title = `${name}'s email template`;

    return (
      <tr key={brand.code}>
        <td>{name}</td>
        <td>
          <Label bsStyle={emailConfig.type == 'simple' ? 'default' : 'info'}>
            {emailConfig.type}
          </Label>
        </td>
        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title={title} trigger={editTrigger}>
              <Config brandId={_id} refetch={refetch} />
            </ModalTrigger>
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { brands } = this.props;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Brand Name</th>
            <th>Current template</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>{brands.map(brand => this.renderRow(brand))}</tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Email appearance' },
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

List.propTypes = propTypes;

export default List;
