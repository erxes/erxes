import { LeftActionBar, Title } from "@erxes/ui-settings/src/styles";
import { IUnit, UnitsMainQueryResponse } from "@erxes/ui/src/team/types";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

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

type Props = {
  listQuery: UnitsMainQueryResponse;
  deleteUnits: (ids: string[], callback: () => void) => void;
  queryParams: Record<string, string>;
};

const MainList = (props: Props) => {
  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || "",
  );

  const remove = (_id?: string) => {
    if (_id) {
      props.deleteUnits([_id], () => setSelectedItems([]));
    } else {
      props.deleteUnits(selectedItems, () => setSelectedItems([]));
    }
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__("Add Unit")}
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form queryType="units" showMainList={true} closeModal={closeModal} />
    );

    return (
      <ModalTrigger title="Add Unit" content={content} trigger={trigger} />
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

  const renderRow = (unit: IUnit) => {
    const handleSelect = () => {
      if (selectedItems.includes(unit._id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== unit._id,
        );
        return setSelectedItems(removedSelectedItems);
      }
      setSelectedItems([...selectedItems, unit._id]);
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
      <tr key={unit._id}>
        <td onClick={onclick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(unit._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(unit.code)}</td>
        <td>{__(unit.title)}</td>
        <td>{__(unit?.supervisor?.email)}</td>
        <td>{__(unit?.department?.title || "")}</td>
        <td>{unit.userIds?.length || 0}</td>
        <td>{unit.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={unit._id}
              title="Edit Unit"
              content={({ closeModal }) => (
                <Form
                  closeModal={closeModal}
                  itemId={unit._id}
                  queryType="units"
                />
              )}
              trigger={trigger}
            />
            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={() => remove(unit._id)}
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

    const units = listQuery.unitsMain.list || [];

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const unitIds = units.map((unit) => unit._id);
        return setSelectedItems(unitIds);
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
                checked={units?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__("Code")}</th>
            <th>{__("Title")}</th>
            <th>{__("Supervisor")}</th>
            <th>{__("Department")}</th>
            <th>{__("Team member count")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{(units || []).map((unit) => renderRow(unit))}</tbody>
      </Table>
    );
  };
  const { listQuery } = props;
  const { totalCount } = listQuery.unitsMain;

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
          title="Units"
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Units") },
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={rightActionBar}
          left={
            <LeftActionBar>
              <Title $capitalize={true}>
                {__("Units")}&nbsp;
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
          count={totalCount}
          data={renderContent()}
          emptyImage="/images/actions/25.svg"
          emptyText="No Units"
        />
      }
      leftSidebar={
        <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
          <SettingsSideBar />
        </LeftSidebar>
      }
      footer={<Pagination count={totalCount} />}
      hasBorder={true}
    />
  );
};

export default MainList;
