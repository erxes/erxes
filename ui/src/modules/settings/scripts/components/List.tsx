import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import List from '../../common/components/List';
import RowActions from '../../common/components/RowActions';
import { ICommonListProps } from '../../common/types';
import Form from '../containers/Form';
import InstallCode from './InstallCode';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonListProps;

class ScriptList extends React.Component<Props> {
  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
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
          <td>
            {object.messenger && (
              <div>
                <Tip text="Messenger" placement="top">
                  <Icon icon="comment-1" />
                </Tip>{' '}
                {object.messenger.name}
              </div>
            )}
            {object.kbTopic && (
              <div>
                <Tip text="Knowledge Base" placement="top">
                  <Icon icon="book-open" />
                </Tip>{' '}
                {object.kbTopic.title}
              </div>
            )}
            {object.leads.length > 0 && (
              <div>
                <Tip text="Pop ups" placement="top">
                  <Icon icon="window" />
                </Tip>
                {object.leads.map(lead => ` ${lead.name},`)}
              </div>
            )}
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
            <th>{__('Integrations')}</th>
            <th style={{ width: 100 }}>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  };

  render() {
    return (
      <List
        formTitle="New script"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Scripts') }
        ]}
        title={__('Scripts')}
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
