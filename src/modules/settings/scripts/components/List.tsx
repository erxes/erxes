import {
  Button,
  HeaderDescription,
  Icon,
  ModalTrigger,
  Table,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { List, RowActions } from '../../common/components';
import { ICommonListProps } from '../../common/types';
import { Form } from '../containers';
import InstallCode from './InstallCode';

class ScriptList extends React.Component<ICommonListProps> {
  renderForm = props => {
    return <Form {...props} />;
  };

  installCodeAction = object => {
    const content = props => <InstallCode {...props} script={object} />;

    return (
      <ModalTrigger
        title="Install code"
        trigger={
          <Button btnStyle="link">
            <Tip text="Install code">
              <Icon icon="copy" />
            </Tip>
          </Button>
        }
        content={content}
      />
    );
  };

  renderRows = ({ objects }) => {
    return objects.map((object, index) => {
      return (
        <tr key={index}>
          <td>{object.name}</td>
          <td>{object.messenger ? object.messenger.name : ''}</td>
          <td>{object.kbTopic ? object.kbTopic.title : ''}</td>
          <td>
            {object.leads ? object.leads.map(lead => `${lead.name} `) : ''}
          </td>
          <RowActions
            {...this.props}
            object={object}
            renderForm={this.renderForm}
            additionalActions={this.installCodeAction}
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
            <th>{__('Name')}</th>
            <th>{__('Messenger')}</th>
            <th>{__('Knowledgebase topic')}</th>
            <th>{__('Leads')}</th>
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
        title="New script"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Scripts') }
        ]}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/23.svg"
            title="Scripts"
            description={`Script manager allows erxes users to quickly and easily generate and update related scripts for any of their business websites. Set up once and your marketing team will be able to easily create forms, add in chats and list FAQs on any of their businesses websites.`}
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

export default ScriptList;
