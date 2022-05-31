import React, { useState } from 'react';
import Select from 'react-select-plus';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import UserList from '../containers/UserList';
import Sidebar from './Sidebar';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import { FilterContainer, InputBar } from '@erxes/ui-settings/src/styles';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import { router } from '@erxes/ui/src/utils';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import UserInvitationForm from '../containers/UserInvitationForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Button from '@erxes/ui/src/components/Button';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IUserGroup } from '@erxes/ui-settings/src/permissions/types';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { ButtonContainer } from '../styles';

const ActiveColor = styledTS<{ active: boolean }>(styled.div)`
  background: ${props =>
    props.active === true ? colors.colorCoreGreen : colors.colorCoreYellow};
  border-radius: 50%;
  height: 10px;
  width: 10px;
  `;

type Props = {
  queryParams: any;
  history: any;
  configsEnvQuery: any;
  loading: boolean;
  usersGroups: IUserGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function Home(props: Props) {
  let timer;
  const { queryParams, history, loading, configsEnvQuery = {} } = props;
  const [searchValue, setSearchValue] = useState('');
  const [active, setActive] = useState(true);

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
    setActive(status.value);
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
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
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
        </InputBar>
        <InputBar type="active">
          <ActiveColor active={active} />
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
        </InputBar>
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

  const trigger = (
    <ButtonContainer>
      <Button btnStyle="success" icon="plus">
        Invite team members
      </Button>
    </ButtonContainer>
  );

  const righActionBar = (
    <ModalTrigger
      content={renderInvitationForm}
      size="xl"
      title="Invite team members"
      autoOpenKey="showMemberInviteModal"
      trigger={trigger}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar
      hasFlex={true}
      right={righActionBar}
      left={renderFilter}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          queryParams={queryParams}
          title={'Team members'}
          submenu={menuContacts}
        />
      }
      leftSidebar={<Sidebar hasBorder={true} loadingMainQuery={loading} />}
      actionBar={actionBar}
      content={<UserList history={history} queryParams={queryParams} />}
      hasBorder={true}
      transparent={true}
    />
  );
}
