import { ControlLabel, FormControl } from "@erxes/ui/src/components/form";
import {
  FilterContainer,
  InputBar,
  Title,
} from "@erxes/ui-settings/src/styles";
import { FlexItem, FlexRow } from "@erxes/ui-settings/src/styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "modules/common/components/pagination/Pagination";
import Select, { OnChangeValue, StylesConfig } from "react-select";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import Sidebar from "./Sidebar";
import UserInvitationForm from "../containers/UserInvitationForm";
import UserList from "../containers/UserList";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "modules/common/utils";
import { colors } from "@erxes/ui/src/styles";
import { router } from "@erxes/ui/src/utils";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { useLocation, useNavigate } from "react-router-dom";

const ActiveColor = styledTS<{ active: boolean }>(styled.div)`
  background: ${(props) =>
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
  totalCount: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function Home(props: Props) {
  let timer;
  const {
    queryParams,
    history,
    loading,
    configsEnvQuery = {},
    totalCount,
  } = props;
  const [searchValue, setSearchValue] = useState("");
  const [active, setActive] = useState(queryParams.isActive || true);
  const location = useLocation();
  const navigate = useNavigate();

  const search = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.setParams(navigate, location, { searchValue: inputValue });
    }, 500);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const onStatusChange = (
    status: OnChangeValue<{ label: string; value: boolean }, false>
  ) => {
    router.setParams(navigate, location, { isActive: status?.value });
    setActive(status?.value && (!status?.value ? status?.value : true));
  };

  const renderBrandChooser = () => {
    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== "true") {
      return null;
    }

    const onSelect = (brandIds) => {
      router.setParams(navigate, location, { brandIds });
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

  const title = (
    <Title $capitalize={true}>
      {__("Team Members")}&nbsp;
      {`(${totalCount || 0})`}
    </Title>
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
    <Button btnStyle="success" icon="plus-circle">
      Invite team members
    </Button>
  );

  const statusOptions = [
    {
      value: true,
      label: __("Active"),
    },
    {
      value: false,
      label: __("Deactivated"),
    },
  ];

  const colourStyles: StylesConfig = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? "rgb(237, 242, 250)"
            : isFocused
              ? "#f0f0f0"
              : undefined,
        color: isDisabled ? "#ccc" : "#333",
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
          backgroundColor: !isDisabled
            ? isSelected
              ? "rgb(237, 242, 250)"
              : "#f0f0f0"
            : undefined,
        },
      };
    },
  };

  const righActionBar = (
    <FilterContainer>
      <FlexRow>
        {renderBrandChooser()}
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
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
        </InputBar>
        <InputBar type="active">
          <ActiveColor active={active} />
          <FlexItem>
            <Select
              placeholder={__("Choose status")}
              value={statusOptions.find(
                (o) =>
                  o.value === (queryParams.isActive === "false" ? false : true)
              )}
              onChange={onStatusChange}
              isClearable={false}
              options={statusOptions}
              className="basic-multi-select"
              isSearchable={false}
              styles={colourStyles}
            />
          </FlexItem>
        </InputBar>
        <ModalTrigger
          content={renderInvitationForm}
          size="xl"
          title="Invite team members"
          autoOpenKey="showMemberInviteModal"
          trigger={trigger}
        />
      </FlexRow>
    </FilterContainer>
  );

  const actionBar = (
    <Wrapper.ActionBar
      hasFlex={true}
      right={righActionBar}
      left={title}
      wideSpacing={true}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Team members")}
          queryParams={queryParams}
          breadcrumb={[{ title: "Team members" }]}
        />
      }
      leftSidebar={
        <Sidebar loadingMainQuery={loading} queryParams={queryParams} />
      }
      actionBar={actionBar}
      content={<UserList history={history} queryParams={queryParams} />}
      transparent={true}
      footer={<Pagination count={totalCount} />}
      hasBorder={true}
    />
  );
}
