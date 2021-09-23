import React, { useState } from 'react';
import Select from 'react-select-plus';

import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import UserList from '../containers/UserList';
import Sidebar from './Sidebar';
import { menuContacts } from 'modules/common/utils/menus';
import { FlexItem, FlexRow } from 'modules/settings/styles';
import { FilterContainer } from '../styles';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import { router } from 'modules/common/utils';
import SelectBrands from 'modules/settings/brands/containers/SelectBrands';
import UserInvitationForm from '../containers/UserInvitationForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Button from 'modules/common/components/Button';
import { IButtonMutateProps } from 'modules/common/types';
import { IUserGroup } from 'modules/settings/permissions/types';
import { dimensions } from 'modules/common/styles';

type Props = {
  queryParams: any;
  history: any;
  configsEnvQuery: any;
  usersGroups: IUserGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function Home(props: Props) {
  let timer;
  const { queryParams, history, configsEnvQuery = {} } = props;
  const [searchValue, setSearchValue] = useState('');

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.setParams(props.history, { searchValue: inputValue });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  const onStatusChange = (status: { label: string; value: boolean }) => {
    router.setParams(history, { isActive: status.value });
  };

  const renderBrandChooser = () => {
    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== 'true') {
      return null;
    }

    const onSelect = brandIds => {
      router.setParams(history, { brandIds });
    };

    return (
      <FlexItem>
        <ControlLabel>{__('Brand')}</ControlLabel>
        <SelectBrands
          label={__('Choose brands')}
          onSelect={onSelect}
          initialValue={queryParams.brandIds}
          name="selectedBrands"
        />
      </FlexItem>
    );
  };

  const renderFilter = (
    <FilterContainer style={{ paddingTop: dimensions.coreSpacing - 10 }}>
      <FlexRow>
        {renderBrandChooser()}
        <FlexItem>
          <FormControl
            placeholder={__('Search')}
            name="searchValue"
            onChange={search}
            value={searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
        </FlexItem>

        <FlexItem>
          <Select
            placeholder={__('Choose status')}
            value={queryParams.isActive || true}
            onChange={onStatusChange}
            clearable={false}
            options={[
              {
                value: true,
                label: __('Active')
              },
              {
                value: false,
                label: __('Deactivated')
              }
            ]}
          />
        </FlexItem>
      </FlexRow>
    </FilterContainer>
  );

  const renderInvitationForm = formProps => {
    const { usersGroups, renderButton } = props;

    return (
      <UserInvitationForm
        closeModal={formProps.closeModal}
        usersGroups={usersGroups}
        renderButton={renderButton}
      />
    );
  };

  const trigger = <Button btnStyle="success">Invite team members</Button>;

  const righActionBar = (
    <ModalTrigger
      content={renderInvitationForm}
      size="xl"
      title="Invite team members"
      trigger={trigger}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar right={righActionBar} left={renderFilter} />
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={'Team members'} submenu={menuContacts} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/21.svg"
          title="Team members"
          description={`${__(
            'Your team members are the bolts and nuts of your business'
          )}.${__('Make sure all the parts are set and ready to go')}.${__(
            'Here you can see a list of all your team members, you can categorize them into groups, welcome new members and edit their info'
          )}`}
        />
      }
      leftSidebar={<Sidebar />}
      actionBar={actionBar}
      content={<UserList history={history} queryParams={queryParams} />}
    />
  );
}
