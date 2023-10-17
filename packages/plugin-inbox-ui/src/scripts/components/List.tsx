import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { EMPTY_CONTENT_SCRIPT } from '@erxes/ui-settings/src/constants';
import React from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import InstallCode from './InstallCode';
import Form from '../containers/Form';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  Templates,
  RowTitle
} from '@erxes/ui-emailtemplates/src/styles';
import { renderToString } from 'react-dom/server';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonListProps;

class ScriptList extends React.Component<Props> {
  closeModal = () => {
    console.log('closed');
  };

  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
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

  installCodeAction = object => {
    const content = props => (
      <InstallCode {...props} script={object} closeModal={this.closeModal} />
    );

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Install code"
        size="lg"
        trigger={
          <div>
            <Icon icon="code" /> Install code
          </div>
        }
        content={content}
      />
    );
  };

  removeTemplate = object => {
    this.props.remove(object._id);
  };

  renderRow = () => {
    return this.props.objects.map((object, index) => {
      const contentHtml = renderToString(
        <InstallCode script={object} closeModal={this.closeModal} />
      );

      return (
        <Template key={index}>
          <RowTitle>
            <div>{object.name}</div>
            <div>
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
                  </Tip>
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
            </div>
          </RowTitle>
          <TemplateBox>
            <Actions>
              {this.renderEditAction(object)}
              <div onClick={this.removeTemplate.bind(this, object)}>
                <Icon icon="cancel-1" /> Delete
              </div>
              {this.installCodeAction(object)}
            </Actions>
            <IframePreview>
              <iframe title="scripts-iframe" srcDoc={contentHtml} />
            </IframePreview>
          </TemplateBox>
        </Template>
      );
    });
  };

  renderContent = () => {
    return <Templates>{this.renderRow()}</Templates>;
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
        emptyContent={<EmptyContent content={EMPTY_CONTENT_SCRIPT} />}
        {...this.props}
        size="lg"
      />
    );
  }
}

export default ScriptList;
