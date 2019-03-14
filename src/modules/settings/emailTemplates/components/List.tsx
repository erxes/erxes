import {
  Button,
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
  EmailTemplates,
  IframePreview,
  Options,
  TemplateBox,
  TemplatePreview
} from '../styles';
import Form from './Form';

class EmailTemplateList extends React.Component<ICommonListProps> {
  renderForm = props => {
    return <Form {...props} />;
  };

  remove = object => {
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
        trigger={
          <span>
            {' '}
            <Icon icon="edit" /> Edit
          </span>
        }
        content={content}
      />
    );
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <EmailTemplates key={index}>
        <TemplateBox>
          <Options>
            <Button btnStyle="primary">Preview</Button>
            <Actions>
              {this.renderEditAction(object)}
              <span onClick={this.remove.bind(this, object)}>
                <Icon icon="cancel-1" /> Delete
              </span>
            </Actions>
          </Options>
          <IframePreview>
            <iframe title="content-iframe" srcDoc={object.content} />
          </IframePreview>
        </TemplateBox>
        <span> {object.name} </span>
      </EmailTemplates>
    ));
  }

  renderContent = props => {
    return <TemplatePreview>{this.renderRow(props)}</TemplatePreview>;
  };

  render() {
    return (
      <List
        title="New email template"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Email templates') }
        ]}
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
