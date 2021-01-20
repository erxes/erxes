import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IBrand } from '../../brands/types';
import Config from '../containers/Config';

type Props = {
  brands: IBrand[];
  refetch: () => void;
};

class List extends React.Component<Props, {}> {
  renderRow(brand) {
    const { refetch } = this.props;
    const { name, _id } = brand;
    const emailConfig = brand.emailConfig || { type: 'simple' };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const title = `${name}'s email template`;

    const content = props => (
      <Config {...props} brandId={_id} refetch={refetch} />
    );

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
            <ModalTrigger
              title={title}
              trigger={editTrigger}
              content={content}
              ignoreTrans={true}
              enforceFocus={false}
              size="lg"
            />
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { brands } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Email appearance') }
    ];

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

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Email appearance')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/29.svg"
                title="Email appearance"
                description={__(
                  'Appearances matter, especially for your business. Edit and manage your email appearance so that your business can operate in one voice'
                )}
              />
            }
          />
        }
        content={content}
        center={true}
      />
    );
  }
}

export default List;
