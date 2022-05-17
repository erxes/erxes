import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  Templates
} from '../styles';
import Form from './Form';
import CategoryList from '@erxes/ui-settings/src/templates/containers/productCategory/CategoryList';
import { EMAIL_TEMPLATE_STATUSES, EMAIL_TEMPLATE_TIPTEXT } from '../constants';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  changeStatus: (_id: string, status: string) => void;
} & ICommonListProps;

class EmailTemplateList extends React.Component<Props> {
  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
  };

  renderDisableAction = object => {
    const { changeStatus } = this.props;
    const _id = object._id;
    const isActive =
      object.status === null ||
      object.status === EMAIL_TEMPLATE_STATUSES.ACTIVE;
    const icon = isActive ? 'archive-alt' : 'redo';

    const status = isActive
      ? EMAIL_TEMPLATE_STATUSES.ARCHIVED
      : EMAIL_TEMPLATE_STATUSES.ACTIVE;

    const text = isActive
      ? EMAIL_TEMPLATE_TIPTEXT.ARCHIVED
      : EMAIL_TEMPLATE_TIPTEXT.ACTIVE;

    if (!changeStatus) {
      return null;
    }

    const onClick = () => changeStatus(_id, status);

    return (
      <Tip text={__(text)}>
        <div onClick={onClick}>
          <Icon icon={icon} /> {text}
        </div>
      </Tip>
    );
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
        enforceFocus={false}
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
      <Template key={index}>
        <TemplateBox>
          <Actions>
            {this.renderEditAction(object)}
            <div onClick={this.removeTemplate.bind(this, object)}>
              <Icon icon="cancel-1" /> Delete
            </div>
            {this.renderDisableAction(object)}
          </Actions>
          <IframePreview>
            <iframe title="content-iframe" srcDoc={object.content} />
          </IframePreview>
        </TemplateBox>
        <h5>{object.name}</h5>
      </Template>
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
            description={`${__(
              `It's all about thinking ahead for your customers`
            )}.${__(
              'Team members will be able to choose from email templates and send out one message to multiple recipients'
            )}.${__(
              'You can use the email templates to send out a Mass email for leads/customers or you can send to other team members'
            )}`}
          />
        }
        renderForm={this.renderForm}
        // rightActionBar={true}
        renderContent={this.renderContent}
        {...this.props}
        queryParams={this.props.queryParams}
        history={this.props.history}
        // hasBorder={true}
        // transparent={true}
        leftSpacing={true}
      />
    );
  }
}

export default EmailTemplateList;
