import {
  ActionButtons,
  Button,
  Icon,
  Label,
  ModalTrigger,
  Table,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { DescImg, MainDescription } from 'modules/settings/styles';
import * as React from 'react';
import { IBrand } from '../../brands/types';
import { Config } from '../containers';

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
        <Tip text="Edit">
          <Icon icon="edit" />
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

    const actionBarLeft = (
      <MainDescription>
        <DescImg src="/images/actions/29.svg" />
        <span>
          <h4>{__('Email appearance')}</h4>
          {__(
            'Appearances matter, especially for your business. Edit and manage your email appearance so that your business can operate in one voice.'
          )}
        </span>
      </MainDescription>
    );

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
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
        content={content}
        transparent={true}
        center={true}
      />
    );
  }
}

export default List;
