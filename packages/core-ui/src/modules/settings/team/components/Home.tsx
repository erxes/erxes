import React, { useState } from "react";
import Select from "react-select-plus";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "../../../common/utils";
import UserList from "../containers/UserList";
import Sidebar from "./Sidebar";
import { FlexItem, FlexRow } from "@erxes/ui-settings/src/styles";
import { FilterContainer } from "@erxes/ui-settings/src/styles";
import { ControlLabel, FormControl } from "@erxes/ui/src/components/form";
import { router } from "@erxes/ui/src/utils";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import UserInvitationForm from "../containers/UserInvitationForm";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Button from "@erxes/ui/src/components/Button";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";
import { colors } from "@erxes/ui/src/styles";
import BreadCrumb from "@erxes/ui/src/components/breadcrumb/NewBreadCrumb";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import Icon from "@erxes/ui/src/components/Icon";
import styled from "styled-components";
import styledTS from 'styled-components-ts';

const SearchBar = styledTS<{width: string}>(styled.div)`
  background: ${colors.bgActive};
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  max-width: ${props => props.width};
  padding: 5px 5px 0 20px;
  border-radius: 8px;
  margin-left: ${props => props.width === "160px" ? '10px' : '0px'};
  height: 41px;
`;

const ActiveColor = styledTS <{active: boolean}>(styled.div)`
  background: ${props => (props.active === true ? colors.colorCoreGreen : colors.colorCoreYellow)};
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
  const [searchValue, setSearchValue] = useState("");
  const [active, setActive]= useState(true);

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.setParams(props.history, { searchValue: inputValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const onStatusChange = (status: { label: string; value: boolean }) => {
    router.setParams(history, { isActive: status.value });
    setActive(status.value);
  };

  const renderBrandChooser = () => {
    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== "true") {
      return null;
    }

    const onSelect = (brandIds) => {
      router.setParams(history, { brandIds });
    };

    return (
      <FlexItem>
        <ControlLabel>{__("Brand")}</ControlLabel>
        <SelectBrands
          label={__("Choose brands")}
          onSelect={onSelect}
          initialValue={queryParams.brandIds}
          name="selectedBrands"
        />
      </FlexItem>
    );
  };

  const renderFilter = (
    <FilterContainer style={{ paddingBottom: 0 }}>
      <FlexRow>
        {renderBrandChooser()}
        <SearchBar width="90%">
          <Icon icon="search-1" size={20}/>
          <FlexItem>
            <FormControl
              placeholder={__("Search")}
              name="searchValue"
              onChange={search}
              value={searchValue}
              autoFocus={true}
              onFocus={moveCursorAtTheEnd}
            />
          </FlexItem>
        </SearchBar>
        <SearchBar width="160px">
        <ActiveColor active={active}/>
        <FlexItem style={{ maxWidth: "112px" }}>
          <Select
            placeholder={__("Choose status")}
            value={queryParams.isActive || true}
            onChange={onStatusChange}
            clearable={false}
            options={[
              {
                value: true,
                label: __("Active"),
              },
              {
                value: false,
                label: __("Deactivated"),
              },
            ]}
          />
        </FlexItem>
        </SearchBar>
      </FlexRow>
    </FilterContainer>
  );

  const renderInvitationForm = (formProps) => {
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
    <Button btnStyle="success" icon="plus">
      Invite team members
    </Button>
  );

  const righActionBar = (
    <ModalTrigger
      content={renderInvitationForm}
      size="xl"
      title="Invite team members"
      trigger={trigger}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar rightWidth="85%" right={righActionBar} left={renderFilter} />
  );

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Team member") },
  ];

  const headerDescription = (
    <HeaderDescription
      icon="/images/icons/erxes-23.svg"
      title={__("Team member")}
      description={`${__(
        "Set up your initial account settings so that things run smoothly in unison"
      )}.`}
    />
  );

  return (
    <Wrapper
      mainHead={<BreadCrumb breadcrumbs={breadcrumb} />}
      subheader={headerDescription}
      leftSidebar={<Sidebar loadingMainQuery={loading} />}
      actionBar={actionBar}
      content={<UserList history={history} queryParams={queryParams} />}
    />
  );
}
