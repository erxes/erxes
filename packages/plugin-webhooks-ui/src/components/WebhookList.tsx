import { AppConsumer } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Icon from '@erxes/ui/src/components/Icon';
import Table from '@erxes/ui/src/components/table';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { router } from '@erxes/ui/src/utils';
import { __ } from '@erxes/ui/src/utils';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import {
  FlexItem,
  FlexRow,
  InputBar,
  Title,
} from '@erxes/ui-settings/src/styles';
import React, { useRef, useState } from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import {
  ICommonFormProps,
  ICommonListProps,
} from '@erxes/ui-settings/src/common/types';
import { FilterContainer } from '@erxes/ui-settings/src/styles';
import WebhookForm from '../containers/WebhookForm';
import WebhookRow from './WebhookRow';
import { FormControl } from '@erxes/ui/src';

type Props = {
  queryParams?: any;
  configsEnvQuery?: any;
  totalCount: number;
  removeWebhook: (id: string) => void;
} & ICommonListProps;

type FinalProps = Props & { currentUser: IUser };

const WebhookList = (props: FinalProps) => {
  const { totalCount, queryParams, history, configsEnvQuery = {} } = props;

  const timerRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState<string>();

  const renderForm = (formProps) => {
    return <WebhookForm {...formProps} queryParams={queryParams} />;
  };

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);

    timerRef.current = window.setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  const renderSearch = () => {
    return (
      <InputBar type="searchBar">
        <Icon icon="search-1" size={20} />
        <FlexItem>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={handleSearch}
            autoFocus={true}
            value={searchValue}
          />
        </FlexItem>
      </InputBar>
    );
  };

  const handleBrandSelect = (brandIds) => {
    router.setParams(history, { brandIds });
  };

  const renderBrandChooser = () => {
    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== 'true') {
      return null;
    }

    return (
      <InputBar type="active">
        <SelectBrands
          label="Filter by brand"
          onSelect={handleBrandSelect}
          initialValue={queryParams.brandIds}
          name="selectedBrands"
          multi={false}
        />
      </InputBar>
    );
  };

  const renderAttionalButtons = () => {
    return (
      <FilterContainer marginRight={true}>
        <FlexRow>
          {renderSearch()}
          {renderBrandChooser()}
        </FlexRow>
      </FilterContainer>
    );
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Enpoint')}</th>
            <th>{__('Status')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <WebhookRow {...props} renderForm={renderForm} />
      </Table>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Webhooks') },
  ];

  const mainHead = (
    <HeaderDescription
      icon="/images/actions/21.svg"
      title={__('Outgoing webhooks')}
      description={__(
        'Webhooks allow you to listen for triggers in your app, which will send relevant data to external URLs in real-time',
      )}
    />
  );

  const title = (
    <Title capitalize={true}>{`${__('Webhooks')} (${totalCount})`}</Title>
  );

  return (
    <List
      formTitle={__('Add Webhook')}
      size="lg"
      breadcrumb={breadcrumb}
      title={__('Webhooks')}
      leftActionBar={title}
      mainHead={mainHead}
      renderForm={renderForm}
      renderContent={renderContent}
      additionalButton={renderAttionalButtons()}
      hasBorder={true}
      {...props}
    />
  );
};

const WithConsumer = (props: Props & ICommonListProps & ICommonFormProps) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WebhookList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
