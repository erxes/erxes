import {
  DepartmentsMainQueryResponse,
  IDepartment,
} from "@erxes/ui/src/team/types";
import { LeftActionBar, Title } from "@erxes/ui-settings/src/styles";
import { __, router } from "@erxes/ui/src/utils";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { BarItems } from "modules/layout/styles";
import Button from "modules/common/components/Button";
import DataWithLoader from "modules/common/components/DataWithLoader";
import Form from "../../containers/common/BlockForm";
import FormControl from "modules/common/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import LeftSidebar from "@erxes/ui/src/layout/components/Sidebar";
import ModalTrigger from "modules/common/components/ModalTrigger";
import Pagination from "modules/common/components/pagination/Pagination";
import React, { useState } from "react";
import SettingsSideBar from "../../containers/common/SettingSideBar";
import SidebarHeader from "@erxes/ui-settings/src/common/components/SidebarHeader";
import Table from "modules/common/components/table";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "modules/layout/components/Wrapper";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { generateTree } from "../../utils";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui/src/team/graphql";
import { useLocation, useNavigate } from "react-router-dom";
import WorkhourForm from "../WorkhourForm";

type Props = {
  listQuery: DepartmentsMainQueryResponse;
  queryParams: Record<string, string>;
  deleteDepartments: (ids: string[], callback: () => void) => void;
};

const MainList = (props: Props) => {
  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || "",
  );

  const refetchQueries = () => [
    {
      query: gql(queries.departmentsMain),
      variables: {
        withoutUserFilter: true,
        searchValue: undefined,
        ...generatePaginationParams(props.queryParams || {}),
      },
    },
  ];

  const remove = (_id?: string) => {
    if (_id) {
      props.deleteDepartments([_id], () => setSelectedItems([]));
    } else {
      props.deleteDepartments(selectedItems, () => setSelectedItems([]));
    }
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__("Add Department")}
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
        queryType="departments"
        additionalRefetchQueries={refetchQueries()}
      />
    );

    return (
      <ModalTrigger
        title="Add Department"
        content={content}
        trigger={trigger}
      />
    );
  };

  const renderSearch = () => {
    const search = (e) => {
      if (timer) {
        clearTimeout(timer);
      }

      const searchValue = e.target.value;

      setSearchValue(searchValue);

      timer = setTimeout(() => {
        router.removeParams(navigate, location, "page");
        router.setParams(navigate, location, { searchValue });
      }, 500);
    };

    const moveCursorAtTheEnd = (e) => {
      const tmpValue = e.target.value;

      e.target.value = "";
      e.target.value = tmpValue;
    };

    return (
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />
    );
  };

  const renderRow = (department: IDepartment, level) => {
    const handleSelect = () => {
      if (selectedItems.includes(department._id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== department._id,
        );
        return setSelectedItems(removedSelectedItems);
      }
      setSelectedItems([...selectedItems, department._id]);
    };

    const onclick = (e) => {
      e.stopPropagation();
    };

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <tr key={department._id}>
        <td onClick={onclick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(department._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${"\u00A0 \u00A0 ".repeat(level)}  ${department.code}`)}</td>
        <td>{__(department.title)}</td>
        <td>{__(department?.supervisor?.email || "-")}</td>
        <td>{department.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Setup workhour of department"
              trigger={
                <Button btnStyle="link">
                  <Tip text={__("Setup workhour")} placement="top">
                    <Icon icon="clock" />
                  </Tip>
                </Button>
              }
              content={({ closeModal }) => (
                <WorkhourForm
                  item={department}
                  type="department"
                  closeModal={closeModal}
                />
              )}
              size="lg"
            />
            <ModalTrigger
              key={department._id}
              title="Edit Department"
              content={({ closeModal }) => (
                <Form
                  itemId={department._id}
                  queryType="departments"
                  additionalRefetchQueries={refetchQueries()}
                  closeModal={closeModal}
                />
              )}
              trigger={trigger}
            />
            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={() => remove(department._id)}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  };

  const renderContent = () => {
    const { listQuery } = props;
    const departments = listQuery.departmentsMain?.list || [];

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const departmentIds = departments.map((department) => department._id);
        return setSelectedItems(departmentIds);
      }

      setSelectedItems([]);
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                checked={departments?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__("Code")}</th>
            <th>{__("Title")}</th>
            <th>{__("Supervisor")}</th>
            <th>{__("Team member count")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(departments, null, (department, level) => {
            return renderRow(department, level);
          })}
          {generateTree(departments, "", (department, level) => {
            return renderRow(department, level);
          })}
        </tbody>
      </Table>
    );
  };

  const { listQuery } = props;
  const { totalCount } = listQuery.departmentsMain;

  const rightActionBar = (
    <BarItems>
      {renderSearch()}
      {renderForm()}
    </BarItems>
  );

  const leftActionBar = selectedItems.length > 0 && (
    <Button
      btnStyle="danger"
      size="small"
      icon="times-circle"
      onClick={() => remove()}
    >
      Remove
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Departments"
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Departments") },
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={rightActionBar}
          left={
            <LeftActionBar>
              <Title $capitalize={true}>
                {__("Departments")}&nbsp;
                {`(${totalCount || 0})`}
              </Title>
              {leftActionBar}
            </LeftActionBar>
          }
        />
      }
      content={
        <DataWithLoader
          loading={listQuery.loading}
          count={totalCount || 0}
          data={renderContent()}
          emptyImage="/images/actions/5.svg"
          emptyText="No Branches"
        />
      }
      leftSidebar={
        <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
          <SettingsSideBar />
        </LeftSidebar>
      }
      footer={<Pagination count={totalCount || 0} />}
      hasBorder={true}
    />
  );
};

export default MainList;
