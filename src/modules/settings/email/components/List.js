import React from 'react';
import PropTypes from 'prop-types';
import {
  Tip,
  ActionButtons,
  ModalTrigger,
  Button,
  Label,
  Icon,
  Table
} from 'modules/common/components';
import { PageContent, Header } from 'modules/layout/components';
import { Config } from '../containers';

const propTypes = {
  brands: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired
};

class List extends React.Component {
  renderRow(brand) {
    const { refetch } = this.props;
    const { name, _id } = brand;
    const emailConfig = brand.emailConfig || { type: 'simple' };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const title = `${name}'s email template`;

    return (
      <tr key={brand.code}>
        <td>{name}</td>
        <td>
          <Label
            lblStyle={emailConfig.type === 'simple' ? 'default' : 'primary'}
          >
            {emailConfig.type}
          </Label>
        </td>
        <td>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{brands.map(brand => this.renderRow(brand))}</tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Email appearance' }
    ];

    return [
      <Header key="breadcrumb" breadcrumb={breadcrumb} />,
      <PageContent key="settings-content">{content}</PageContent>
    ];
  }
}

List.propTypes = propTypes;

export default List;
