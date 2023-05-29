import Button from '@erxes/ui/src/components/Button';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Table from '@erxes/ui/src/components/table';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { EMPTY_CONTENT_SCRIPT } from '@erxes/ui-settings/src/constants';
import React from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import RowActions from '@erxes/ui-settings/src/common/components/RowActions';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import InstallCode from './InstallCode';
import Form from '../containers/Form';

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
            <Tip text="Install code" placement="top">
              <Icon icon="code" />
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
                <Tip text="Forms" placement="top">
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
            <th style={{ width: 120 }}>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
  };

  render() {
    return (
      <List
        formTitle={__('New script')}
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Scripts') }
        ]}
        title={__('Scripts')}
        mainHead={
          <HeaderDescription
            icon="/images/actions/23.svg"
            title="Scripts"
            description={`${__(
              'Script manager allows erxes users to quickly and easily generate and update related scripts for any of their business websites'
            )}.${__(
              `Set up once and your team will be able to easily display multiple erxes widgets on any of their businesses websites`
            )}`}
          />
        }
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        center={true}
        emptyContent={<EmptyContent content={EMPTY_CONTENT_SCRIPT} />}
        {...this.props}
      />
    );
  }
}

export default ScriptList;
