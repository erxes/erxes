import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { BoxContainer } from 'modules/growthHacks/components/home/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import List from '../../common/components/List';
import { ICommonListProps } from '../../common/types';
import { Actions, Bottom, BoxItem, Created } from '../styles';
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
              <Icon icon="edit-3" />
            </Tip>
          </div>
        }
        content={content}
      />
    );
  };

  renderDuplicateAction(object) {
    return (
      <Tip text="Duplicate">
        <div onClick={this.duplicateTemplate.bind(this, object._id)}>
          <Icon icon="copy-1" />
        </div>
      </Tip>
    );
  }

  renderActions = object => {
    if (object.isDefinedByErxes) {
      return <Actions>{this.renderDuplicateAction(object)}</Actions>;
    }

    return (
      <Actions>
        {this.renderEditAction(object)}
        {this.renderDuplicateAction(object)}
        <Tip text="Remove">
          <div onClick={this.removeTemplate.bind(this, object)}>
            <Icon icon="trash" />
          </div>
        </Tip>
      </Actions>
    );
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <BoxItem key={index}>
        <div>
          <h5>{object.name}</h5>
          <p>{object.description}</p>
        </div>
        <Bottom>
          <Created>{dayjs(object.createdAt).format('DD MMM YYYY')}</Created>
          {this.renderActions(object)}
        </Bottom>
      </BoxItem>
    ));
  }

  renderContent = props => {
    return <BoxContainer>{this.renderRow(props)}</BoxContainer>;
  };

  renderButton = () => {
    return (
      <Link to="/settings/boards/growthHack">
        <Button icon="award" btnStyle="primary">
          Go to Campaign
        </Button>
      </Link>
    );
  };

  render() {
    return (
      <List
        formTitle={__('New Growth Hacking Templates')}
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Growth Hacking Templates') }
        ]}
        title={__('Growth Hacking Templates')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/34.svg"
            title="Growth Hacking Templates"
            description={`${__(
              'Manage your boards and pipelines so that its easy to manage incoming leads or requests that is adaptable to your teams needs'
            )}.${__(
              'Add in or delete boards and pipelines to keep business development on track and in check'
            )}`}
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
