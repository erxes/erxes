import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import {
  Actions,
  Template,
  Templates
} from 'modules/settings/emailTemplates/styles';
import React from 'react';
import List from '../../common/components/List';
import { ICommonListProps } from '../../common/types';
import { TemplateBoxContent } from '../styles';
import TemplateForm from './TemplateForm';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonListProps;

class TemplateList extends React.Component<Props> {
  renderForm = props => {
    return <TemplateForm {...props} renderButton={this.props.renderButton} />;
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
        dialogClassName="transform"
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
        <TemplateBoxContent>
          <Actions>
            {this.renderEditAction(object)}
            <div onClick={this.removeTemplate.bind(this, object)}>
              <Icon icon="cancel-1" /> Delete
            </div>
          </Actions>
          <h5>{object.name}</h5>
          <p>{object.description}</p>
        </TemplateBoxContent>
      </Template>
    ));
  }

  renderContent = props => {
    return <Templates>{this.renderRow(props)}</Templates>;
  };

  render() {
    return (
      <List
        formTitle="New growth hack template"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Growth hack templates') }
        ]}
        title={__('Growth hack templates')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/34.svg"
            title="Growth hack templates"
            description={`Manage your boards and pipelines so that its easy to manage incoming leads or requests that is adaptable to your team's needs. Add in or delete boards and pipelines to keep business development on track and in check.`}
          />
        }
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        {...this.props}
      />
    );
  }
}

export default TemplateList;
