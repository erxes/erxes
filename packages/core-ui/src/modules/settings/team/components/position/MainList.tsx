import { LeftActionBar, Title } from "@erxes/ui-settings/src/styles";
import {
  IPosition,
  PositionsMainQueryResponse,
} from "@erxes/ui/src/team/types";
import React, { useState } from "react";
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

type Props = {
  listQuery: PositionsMainQueryResponse;
  deletePositions: (ids: string[], callback: () => void) => void;
  queryParams: Record<string, string>;
};

const MainList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { queryParams, listQuery, deletePositions } = props;
  const positions = listQuery?.positionsMain?.list || [];

  const { totalCount } = listQuery.positionsMain;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(queryParams.searchValue);

  let timer;

  const refetchQueries = () => [
    {
      query: gql(queries.positionsMain),
      variables: {
        withoutUserFilter: true,
        searchValue: undefined,
        ...generatePaginationParams(queryParams || {}),
      },
    },
  ];

  const remove = (_id?: string) => {
    if (_id) {
      deletePositions([_id], () => setSelectedItems([]));
    } else {
      deletePositions(selectedItems, () => setSelectedItems([]));
    }
  };

  const renderRow = (position: IPosition, level) => {
    const handleSelect = () => {
      if (selectedItems.includes(position._id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== position._id,
        );
        setSelectedItems(removedSelectedItems);
        return;
      }

      setSelectedItems([...selectedItems, position._id]);
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
      <tr key={position._id}>
        <td onClick={onclick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(position._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${"\u00A0 \u00A0 ".repeat(level)}  ${position.code}`)}</td>
        <td>{__(position.title)}</td>
        <td>{position?.parent?.title || ""}</td>
        <td>{position.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={position._id}
              title="Edit position"
              content={({ closeModal }) => (
                <Form
                  itemId={position._id}
                  queryType="positions"
                  closeModal={closeModal}
                  additionalRefetchQueries={refetchQueries()}
                />
              )}
              trigger={trigger}
            />
            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={() => remove(position._id)}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  };

  const renderContent = () => {
    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const positionIds = positions.map((branch) => branch._id);
        setSelectedItems(positionIds);
      }
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                checked={positions?.length === selectedItems.length}
                onClick={handleSelectAll}
              />
            </th>
            <th>{__("Code")}</th>
            <th>{__("Title")}</th>
            <th>{__("Parent")}</th>
            <th>{__("Team member count")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(positions, null, (position, level) =>
            renderRow(position, level),
          )}

          {generateTree(positions, "", (position, level) =>
            renderRow(position, level),
          )}

          {/* {positions.map(p => renderRow(p, 1))} */}
        </tbody>
      </Table>
    );
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__("Add Position")}
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
        queryType="positions"
        additionalRefetchQueries={refetchQueries()}
      />
    );

    return (
      <ModalTrigger title="Add Position" content={content} trigger={trigger} />
    );
  };

  const renderSearch = () => {
    const search = (e) => {
      if (timer) {
        clearTimeout(timer);
      }

      e.preventDefault();

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
          title="Positions"
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Positions") },
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={
            <LeftActionBar>
              <Title $capitalize={true}>
                {__("Positions")}&nbsp;
                {`(${totalCount || 0})`}
              </Title>
              {leftActionBar}
            </LeftActionBar>
          }
          right={rightActionBar}
        />
      }
      content={
        <DataWithLoader
          loading={listQuery.loading}
          count={totalCount || 0}
          data={renderContent()}
          emptyImage="/images/actions/5.svg"
          emptyText="No Positions"
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
