import {
  FilterItem,
  FilterWrapper,
  NotWrappable,
} from "@erxes/ui-settings/src/permissions/styles";
import { IActions, IModule, IPermissionDocument } from "../types";
import { __, router } from "modules/common/utils";
import {
  correctValue,
  filterActions,
  generateModuleParams,
  generatedList,
} from "./utils";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "modules/common/components/Button";
import DataWithLoader from "modules/common/components/DataWithLoader";
import { FormControl } from "modules/common/components/form";
import GroupList from "../containers/GroupList";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";
import ModalTrigger from "modules/common/components/ModalTrigger";
import Pagination from "modules/common/components/pagination/Pagination";
import PermissionFixer from "./PermissionFixer";
import PermissionForm from "./PermissionForm";
import PermissionRow from "./PermissionRow";
import React from "react";
import Select from "react-select";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Table from "modules/common/components/table";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "modules/layout/components/Wrapper";

type Props = {
  queryParams: Record<string, string>;
  isLoading: boolean;
  totalCount: number;
  currentGroupName?: string;
  fixPermissions: any;
} & commonProps;

type commonProps = {
  modules: IModule[];
  actions: IActions[];
  groups: IUserGroup[];
  permissions: IPermissionDocument[];
  remove: (id: string) => void;
  refetchQueries: any;
};

const PermissionList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const setFilter = (name: string, item: generatedList) => {
    router.setParams(navigate, location, {
      [name]: typeof item === "object" ? correctValue(item) : item,
      page: null,
      perPage: null,
    });
  };

  const renderObjects = () => {
    const { groups, modules, permissions, actions, refetchQueries, remove } =
      props;

    return permissions.map((object) => {
      return (
        <PermissionRow
          key={object._id}
          actions={actions}
          groups={groups}
          modules={modules}
          removeItem={remove}
          permission={object}
          refetchQueries={refetchQueries}
        />
      );
    });
  };

  const renderFilter = () => {
    const { queryParams, modules, actions } = props;

    const usersOnChange = (users) => {
      setFilter("userId", users);
    };

    const allowedOnChange = (e) => {
      setFilter("allowed", {
        value: e.target.checked ? "allowed" : "notAllowed",
      });
    };

    return (
      <FilterWrapper>
        <strong>{__("Filters")}:</strong>
        <FilterItem id="permission-choose-module">
          <Select
            isClearable={true}
            placeholder={__("Choose module")}
            value={generateModuleParams(modules).find(
              (o) => o.value === queryParams.module
            )}
            options={generateModuleParams(modules)}
            onChange={(e) => setFilter("module", e as generatedList)}
          />
        </FilterItem>

        <FilterItem id="permission-choose-action">
          <Select
            isClearable={true}
            placeholder={__("Choose action")}
            value={filterActions(actions, queryParams.module).find(
              (o) => o.value === queryParams.action
            )}
            options={filterActions(actions, queryParams.module)}
            onChange={(e) => setFilter("action", e as generatedList)}
          />
        </FilterItem>
        <FilterItem id="permission-choose-users">
          <SelectTeamMembers
            label={__("Choose users")}
            name="userId"
            initialValue={queryParams.userId}
            onSelect={usersOnChange}
            multi={false}
          />
        </FilterItem>

        <div>
          <strong>{__("Granted")}:</strong>
          <FormControl
            componentclass="checkbox"
            defaultChecked={queryParams.allowed !== "notAllowed"}
            id="allowed"
            onChange={allowedOnChange}
          />
        </div>
      </FilterWrapper>
    );
  };

  const renderData = () => {
    return (
      <Table $whiteSpace="nowrap" $hover={true} $bordered={true}>
        <thead>
          <tr>
            <th>{__("Module")}</th>
            <th>{__("Action")}</th>
            <th>{__("Email")}</th>
            <th>{__("Group")}</th>
            <th>{__("Allow")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  };

  const renderForm = (moduleProps) => {
    const { modules, actions, groups, refetchQueries, isLoading } = props;

    const extendedProps = {
      ...moduleProps,
      modules,
      actions,
      groups,
      isLoading,
      refetchQueries,
    };

    return <PermissionForm {...extendedProps} />;
  };

  const renderPermissionFixer = (modalProps) => {
    const updatedProps = {
      ...modalProps,
      fixPermissions: props.fixPermissions,
    };

    return <PermissionFixer {...updatedProps} />;
  };

  const renderActionBar = () => {
    const trigger = (
      <Button
        id="permission-new-permission"
        btnStyle="success"
        icon="plus-circle"
      >
        New permission
      </Button>
    );

    const fixTrigger = (
      <Button id="fix-permissions" btnStyle="simple" icon="wrench">
        Fix permissions
      </Button>
    );

    const title = (
      <Title>{props.currentGroupName || __("All permissions")}</Title>
    );

    const actionBarRight = (
      <NotWrappable>
        <ModalTrigger
          title="Fix permissions"
          trigger={fixTrigger}
          content={renderPermissionFixer}
        />
        <ModalTrigger
          title="New permission"
          size="lg"
          trigger={trigger}
          content={renderForm}
        />
      </NotWrappable>
    );

    return (
      <Wrapper.ActionBar
        left={title}
        right={actionBarRight}
        wideSpacing={true}
      />
    );
  };

  const renderContent = () => {
    const { isLoading, totalCount } = props;

    return (
      <>
        {renderFilter()}
        <DataWithLoader
          data={renderData()}
          loading={isLoading}
          count={totalCount}
          emptyText={__("There is no permissions in this group")}
          emptyImage="/images/actions/11.svg"
        />
      </>
    );
  };

  const { totalCount, queryParams } = props;

  const breadcrumb = [
    { title: "Settings", link: "/settings" },
    { title: __("Permissions") },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Permissions")}
          queryParams={queryParams}
          breadcrumb={breadcrumb}
          filterTitle={props.currentGroupName}
        />
      }
      actionBar={renderActionBar()}
      leftSidebar={<GroupList queryParams={queryParams} />}
      footer={<Pagination count={totalCount} />}
      content={renderContent()}
      center={false}
      hasBorder={true}
    />
  );
};

export default PermissionList;
