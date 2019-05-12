import { HeaderDescription, Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { List, RowActions } from '../../common/components';
import { ICommonListProps } from '../../common/types';
import { Form } from '../containers';

class ResponseTemplateList extends React.Component<ICommonListProps> {
  renderForm = props => {
    return <Form {...props} />;
  };

  renderRows = ({ objects }) => {
    return objects.map((object, index) => {
      const brand = object.brand || {};

      return (
        <tr key={index}>
          <td>{brand.name}</td>
          <td>{object.name}</td>
          <RowActions
            {...this.props}
            object={object}
            renderForm={this.renderForm}
          />
        </tr>
      );
    });
  };

  renderContent = props => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Brand')}</th>
            <th>{__('Name')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  };

  render() {
    return (
      <List
        formTitle="New response template"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Response templates') }
        ]}
        title={__('Response templates')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/24.svg"
            title="Response templates"
            description={`Make things easy for your team members and add in ready made response templates. Manage and edit your response templates according to each situation and respond in a timely manner and without the hassle.`}
          />
        }
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
  }
}

export default ResponseTemplateList;
