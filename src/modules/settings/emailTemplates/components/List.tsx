import {
  HeaderDescription,
  Icon,
  ModalTrigger
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { List } from '../../common/components';
import { ICommonListProps } from '../../common/types';
import {
  Actions,
  EmailTemplate,
  IframePreview,
  TemplateBox,
  Templates
} from '../styles';
import Form from './Form';

class EmailTemplateList extends React.Component<ICommonListProps> {
  renderForm = props => {
    return <Form {...props} />;
  };

  removeTemplate = object => {
    this.props.remove(object._id);
  };

  renderEditAction = object => {
    const { save } = this.props;

    const content = props => {
      return this.renderForm({ ...props, object, save });
    };

    return (
      <ModalTrigger
        title="Edit"
        size="lg"
        trigger={
          <div>
            <Icon icon="edit" /> Edit
          </div>
        }
        content={content}
      />
    );
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <EmailTemplate key={index}>
        <TemplateBox>
          <Actions>
            {this.renderEditAction(object)}
            <div onClick={this.removeTemplate.bind(this, object)}>
              <Icon icon="cancel-1" /> Delete
            </div>
          </Actions>
          <IframePreview>
            <iframe title="content-iframe" srcDoc={object.content} />
          </IframePreview>
        </TemplateBox>
        <h5>{object.name}</h5>
      </EmailTemplate>
    ));
  }

  renderContent = props => {
    return <Templates>{this.renderRow(props)}</Templates>;
  };

  render() {
    return (
      <List
        formTitle="New email template"
        size="lg"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Email templates') }
        ]}
        title={__('Email templates')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/22.svg"
            title="Email templates"
            description={`It's all about thinking ahead for your customers. Team members will be able to choose from email templates and send out one message to multiple recipients. You can use the email templates to send out a Mass email for leads/customers or you can send to other team members.`}
          />
        }
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        {...this.props}
      />
    );
  }
}

export default EmailTemplateList;
