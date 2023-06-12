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
import Sidebar from './SideBar';
import Tags from '@erxes/ui/src/components/Tags';
import EmailTemplateRow from './EmailTemplateRow';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  duplicate: (id: string) => void;
} & ICommonListProps;

class EmailTemplateList extends React.Component<Props> {
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
    return this.props.objects.map((object, index) => {
      return <EmailTemplateRow index={index} object={object} />;
    });
  };

  searchHandler = event => {
    const { history } = this.props;

    router.setParams(history, { page: 1, searchValue: event.target.value });
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
        leftSidebar={
          <Sidebar
            loadingMainQuery={false}
            type={'emailtemplates:emailtemplates'}
          />
        }
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
