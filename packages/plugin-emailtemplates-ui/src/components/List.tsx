import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import { Templates } from '../styles';
import Form from './Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import { router } from 'coreui/utils';
import Sidebar from './SideBar';
import EmailTemplateRow from './EmailTemplateRow';
import Button from '@erxes/ui/src/components/Button';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries } from '@erxes/ui-contacts/src/customers/graphql';
import { gql } from '@apollo/client';
import Widget from '@erxes/ui-engage/src/containers/Widget';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  duplicate: (id: string) => void;
  toggleBulk: (target: any, toAdd: boolean) => void;
  bulk: any[];
  emptyBulk: () => void;
  type: string;
} & ICommonListProps;

class EmailTemplateList extends React.Component<Props> {
  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
  };

  renderRow = () => {
    const { toggleBulk, bulk, duplicate, remove, renderButton } = this.props;

    return this.props.objects.map((object, index) => {
      const { name, content, createdAt, modifiedAt, createdUser, tags } =
        object || {};

      return (
        <EmailTemplateRow
          key={index}
          index={index}
          object={object}
          toggleBulk={toggleBulk}
          isChecked={bulk.includes(object)}
          duplicate={duplicate}
          remove={remove}
          renderButton={renderButton}
        />
      );
    });
  };

  searchHandler = event => {
    const { history } = this.props;

    router.setParams(history, { page: 1, searchValue: event.target.value });
  };

  renderContent = () => {
    return <Templates>{this.renderRow()}</Templates>;
  };

  // afterTag = () => {
  //   this.props.emptyBulk();

  //   if (this.props.refetch) {
  //     this.props.refetch();
  //   }
  // };

  render() {
    const { bulk, type, emptyBulk } = this.props;

    let leftActionBar: React.ReactNode;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      const refetchQuery = {
        query: gql(queries.customerCounts),
        variables: { type, only: 'byTag' }
      };

      leftActionBar = (
        <BarItems>
          {/* <Widget customers={bulk} emptyBulk={emptyBulk} /> */}

          {isEnabled('tags') && (
            <TaggerPopover
              type={'emailtemplates:emailtemplates'}
              // successCallback={this.afterTag}
              targets={bulk}
              trigger={tagButton}
              refetchQueries={[refetchQuery]}
            />
          )}
        </BarItems>
      );
    }

    return (
      <List
        formTitle="New email template"
        size="lg"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Email templates') }
        ]}
        title={__('Email templates')}
        mainHead={
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
        leftActionBar={leftActionBar}
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
