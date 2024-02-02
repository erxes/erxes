import React from 'react';

import {
  FilterContainer,
  FlexItem,
  InputBar,
} from '@erxes/ui-settings/src/styles';
import Form from '@erxes/ui-emailtemplates/src/containers/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import List from '@erxes/ui-settings/src/common/components/List';
import { __, router, Icon } from '@erxes/ui/src';
import { Templates } from '@erxes/ui-emailtemplates/src/styles';

import Row from './Row';

import { ICommonListProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  queryParams: any;
  history: any;
  duplicate: (id: string) => void;
  loading: boolean;
} & ICommonListProps;

const EmailTemplateList = (props: Props) => {
  const { objects, queryParams, history } = props;

  const [search, setSearch] = React.useState(
    router.getParam(history, 'searchValue'),
  );
  const timerRef = React.useRef<number | null>(null);

  const searchHandler = (event) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = event.target.value;
    setSearch(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.setParams(history, { page: 1, searchValue });
    }, 500);
  };

  const renderSearch = () => {
    return (
      <FilterContainer marginRight={true}>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FlexItem>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={searchHandler}
              defaultValue={search}
              autoFocus={true}
            />
          </FlexItem>
        </InputBar>
      </FilterContainer>
    );
  };

  const renderForm = (formProps) => {
    return <Form {...formProps} />;
  };

  const renderContent = () => {
    return (
      <Templates>
        {objects.map((object, index) => (
          <Row key={index} {...props} object={object} />
        ))}
      </Templates>
    );
  };

  return (
    <List
      {...props}
      formTitle="New email template"
      size="lg"
      breadcrumb={[
        { title: __('Settings'), link: '/settings' },
        { title: __('Email templates') },
      ]}
      title={__('Email templates')}
      leftActionBar={
        <HeaderDescription
          icon="/images/actions/22.svg"
          title="Email templates"
          description={`${__(
            `It's all about thinking ahead for your customers`,
          )}.${__(
            'Team members will be able to choose from email templates and send out one message to multiple recipients',
          )}.${__(
            'You can use the email templates to send out a Mass email for leads/customers or you can send to other team members',
          )}`}
        />
      }
      renderForm={renderForm}
      renderContent={renderContent}
      queryParams={queryParams}
      history={history}
      additionalButton={renderSearch()}
    />
  );
};

export default EmailTemplateList;
