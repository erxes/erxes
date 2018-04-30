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
import { Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/Sidebar';
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
            <ModalTrigger title={title} trigger={editTrigger} ignoreTrans>
              <Config brandId={_id} refetch={refetch} />
            </ModalTrigger>
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { brands } = this.props;
    const { __ } = this.context;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>{__('Brand Name')}</th>
            <th>{__('Current template')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{brands.map(brand => this.renderRow(brand))}</tbody>
      </Table>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Email appearance') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
