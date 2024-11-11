import {
  FilterItem,
  FilterWrapper,
} from "@erxes/ui-settings/src/permissions/styles";
import { ICategory, IPermission, IUserGroupDocument } from "../../types";
import { __, router } from "@erxes/ui/src/utils";
import { correctValue, generateModuleParams, generatedList } from "../../utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import GroupList from "../../containers/permission/GroupList";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { PERMISSIONS } from "../../constants";
import PermissionForm from "./PermissionForm";
import PermissionRow from "../../containers/permission/PermissionRow";
import React from "react";
import Select from "react-select";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui-settings/src/styles";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { isObject } from "util";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  refetchQueries: any;
  permissions: IPermission[];
  isLoading?: boolean;
  totalCount?: number;
  currentGroupName?: string;
  permissionGroups?: IUserGroupDocument[];
  categoryList?: ICategory[];
};

const PermissionList = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const setFilter = (name: string, item: generatedList) => {
    router.setParams(navigate, location, {
      [name]: isObject(item) ? correctValue(item) : item,
      page: null,
      perPage: null,
    });
  };

  const renderObjects = () => {
    return <PermissionRow permissions={props.permissions} />;
  };

  const renderFilter = () => {
    const { queryParams, categoryList } = props;

    return (
      <FilterWrapper>
        <strong>{__("Filters")}:</strong>
        <FilterItem id="permission-choose-module">
          <Select
            placeholder={__("Choose category")}
            value={generateModuleParams(categoryList || []).find(
              (o) => o.value === queryParams.categoryId
            )}
            options={generateModuleParams(categoryList || [])}
            isClearable={true}
            onChange={setFilter.bind(this, "categoryId")}
          />
        </FilterItem>

        <FilterItem id="permission-choose-action">
          <Select
            placeholder={__("Choose permission")}
            value={generateModuleParams(PERMISSIONS).find(
              (o) => o.value === queryParams.permission
            )}
            options={generateModuleParams(PERMISSIONS)}
            isClearable={true}
            onChange={setFilter.bind(this, "permission")}
          />
        </FilterItem>
      </FilterWrapper>
    );
  };

  const renderData = () => {
    return (
      <Table $whiteSpace="nowrap" $hover={true} $bordered={true}>
        <thead>
          <tr>
            <th>{__("Category")}</th>
            <th>{__("Permission")}</th>
            <th>{__("Group")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  };

  const renderForm = (props) => {
    const { categoryList, queryParams, refetchQueries } = props;

    const extendedProps = {
      ...props,
      groupId: queryParams && (queryParams.groupId || ""),
      categoryList,
      refetchQueries,
    };

    return <PermissionForm {...extendedProps} />;
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

    const title = (
      <Title>{props.currentGroupName || __("All permissions")}</Title>
    );

    const actionBarRight = (
      <ModalTrigger
        title={__("New permission")}
        size="lg"
        trigger={trigger}
        content={renderForm}
      />
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
    const { isLoading, permissions } = props;

    return (
      <>
        {renderFilter()}
        <DataWithLoader
          data={renderData()}
          loading={isLoading || false}
          count={permissions.length}
          emptyText={__("There is no permissions in this group")}
          emptyImage="/images/actions/11.svg"
        />
      </>
    );
  };

  const { queryParams, permissionGroups } = props;

  const breadcrumb = [
    { title: "Settings", link: "/settings" },
    { title: __("Forum Permissions") },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Forum Permissions")}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={renderActionBar()}
      leftSidebar={
        <GroupList
          permissionGroups={permissionGroups}
          queryParams={queryParams}
        />
      }
      content={renderContent()}
      center={false}
      hasBorder={true}
    />
  );
};

export default PermissionList;
