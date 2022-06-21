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
  Templates,
  TemplateInfo
} from '../styles';
import Form from './Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import { router } from 'coreui/utils';
import dayjs from 'dayjs';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  duplicate: (id: string) => void;
} & ICommonListProps;

type State = {
  items: any;
  searchValue: string;
};

class EmailTemplateList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: props.objects,
      searchValue: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.objects !== this.props.objects) {
      this.setState({ items: nextProps.objects });
    }
  }

  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
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

  renderDuplicateAction(object) {
    return (
      <div onClick={this.duplicateTemplate.bind(this, object._id)}>
        <Icon icon="copy-1" />
        Duplicate
      </div>
    );
  }

  renderDate(createdAt, modifiedAt) {
    if (createdAt === modifiedAt) {
      if (createdAt === null) return '-';

      return dayjs(createdAt).format('DD MMM YYYY');
    }

    return dayjs(modifiedAt).format('DD MMM YYYY');
  }

  renderRow = () => {
    return this.state.items.map((object, index) => {
      const { name, content, createdAt, modifiedAt, createdUser } =
        object || {};

      return (
        <Template key={index} isLongName={name.length > 46}>
          <h5>{name}</h5>
          <TemplateBox>
            <Actions>
              {this.renderEditAction(object)}
              <div onClick={this.removeTemplate.bind(this, object)}>
                <Icon icon="cancel-1" /> Delete
              </div>
              {this.renderDuplicateAction(object)}
            </Actions>
            <IframePreview>
              <iframe title="content-iframe" srcDoc={content} />
            </IframePreview>
          </TemplateBox>
          <TemplateInfo>
            <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
            <p>{this.renderDate(createdAt, modifiedAt)}</p>
          </TemplateInfo>
          <TemplateInfo>
            <p>Created by</p>
            {createdUser ? (
              createdUser.details.fullName && (
                <p>{createdUser.details.fullName}</p>
              )
            ) : (
              <p>erxes Inc</p>
            )}
          </TemplateInfo>
        </Template>
      );
    });
  };

  searchHandler = event => {
    const { history } = this.props;

    router.setParams(history, { searchValue: event.target.value });
  };

  renderContent = () => {
    return <Templates>{this.renderRow()}</Templates>;
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
        renderContent={this.renderContent}
        {...this.props}
        queryParams={this.props.queryParams}
        history={this.props.history}
        additionalButton={
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={this.searchHandler}
            value={router.getParam(this.props.history, 'searchValue')}
            autoFocus={true}
          />
        }
      />
    );
  }
}

export default EmailTemplateList;
