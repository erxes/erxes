import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import List from '../../common/components/List';
import { ICommonListProps } from '../../common/types';
import {
  Actions,
  Bottom,
  Created,
  TemplateContainer,
  TemplateItem
} from '../styles';
import TemplateForm from './TemplateForm';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  duplicate: (id: string) => void;
} & ICommonListProps;

class TemplateList extends React.Component<Props> {
  renderForm = props => {
    return <TemplateForm {...props} renderButton={this.props.renderButton} />;
  };

  removeTemplate = object => {
    this.props.remove(object._id);
  };

  duplicateTemplate = id => {
    this.props.duplicate(id);
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
        trigger={
          <div>
            <Tip text="Edit">
              <Icon icon="edit-alt" />
            </Tip>
          </div>
        }
        content={content}
      />
    );
  };

  renderActions = object => {
    if (object.isDefinedByErxes) {
      return null;
    }

    return (
      <Actions>
        {this.renderEditAction(object)}
        <Tip text="Duplicate">
          <div onClick={this.duplicateTemplate.bind(this, object._id)}>
            <Icon icon="copy-1" />
          </div>
        </Tip>
        <Tip text="Remove">
          <div onClick={this.removeTemplate.bind(this, object)}>
            <Icon icon="trash-4" />
          </div>
        </Tip>
      </Actions>
    );
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <TemplateItem key={index}>
        <div>
          <h5>{object.name}</h5>
          <p>{object.description}</p>
        </div>
        <Bottom>
          <Created>{dayjs(object.createdAt).format('DD MMM YYYY')}</Created>
          {this.renderActions(object)}
        </Bottom>
      </TemplateItem>
    ));
  }

  renderContent = props => {
    return <TemplateContainer>{this.renderRow(props)}</TemplateContainer>;
  };

  renderButton = () => {
    return (
      <Link to="/settings/boards/growthHack">
        <Button size="small" icon="award" btnStyle="primary">
          Go to Campaign
        </Button>
      </Link>
    );
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
        additionalButton={this.renderButton()}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        {...this.props}
      />
    );
  }
}

export default TemplateList;
