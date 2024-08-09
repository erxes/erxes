import { ControlLabel, FormControl } from "@erxes/ui/src/components/form";
import { Title } from "@erxes/ui-settings/src/styles";
import { FlexItem } from "@erxes/ui-settings/src/styles";
import React, { useState } from "react";
import { BarItems } from "@erxes/ui/src/layout/styles";

import Button from "@erxes/ui/src/components/Button";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "modules/common/components/pagination/Pagination";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import Sidebar from "./Sidebar";
import UserInvitationForm from "../containers/UserInvitationForm";
import UserList from "../containers/UserList";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "modules/common/utils";
import { router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown from "@erxes/ui/src/components/Dropdown";

type Props = {
  queryParams: Record<string, string>;
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

  const onStatusChange = (status: boolean) => {
    router.setParams(navigate, location, { isActive: status });
    setActive(status && (!status ? status : true));
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

  const righActionBar = (
    <BarItems>
      {renderBrandChooser()}
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
      <Dropdown
        toggleComponent={
          <Button btnStyle="simple" size="small">
            {__(active ? "Active" : "Deactivated")} <Icon icon="angle-down" />
          </Button>
        }
      >
        <li>
          <a href="#" onClick={() => onStatusChange(true)}>
            Active
          </a>
        </li>
        <li>
          <a href="#" onClick={() => onStatusChange(false)}>
            Deactivated
          </a>
        </li>
      </Dropdown>
      <ModalTrigger
        content={renderInvitationForm}
        size="xl"
        title="Invite team members"
        autoOpenKey="showMemberInviteModal"
        trigger={trigger}
      />
    </BarItems>
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
      content={<UserList queryParams={queryParams} />}
      transparent={true}
      footer={<Pagination count={totalCount} />}
      hasBorder={true}
    />
  );
}
