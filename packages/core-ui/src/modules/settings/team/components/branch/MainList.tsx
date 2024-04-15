import { BranchesMainQueryResponse, IBranch } from "@erxes/ui/src/team/types";
import {
  FilterContainer,
  InputBar,
  LeftActionBar,
  Title,
} from "@erxes/ui-settings/src/styles";
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

type Props = {
  listQuery: BranchesMainQueryResponse;
  deleteBranches: (ids: string[], callback: () => void) => void;
  queryParams: any;
};

const MainList = (props: Props) => {
  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || ""
  );

  const refetchQueries = () => [
    {
      query: gql(queries.branchesMain),
      variables: {
        withoutUserFilter: true,
        searchValue: undefined,
        ...generatePaginationParams(props.queryParams || {}),
      },
    },
  ];

  const remove = (_id?: string) => {
    if (_id) {
      props.deleteBranches([_id], () => setSelectedItems([]));
    } else {
      props.deleteBranches(selectedItems, () => setSelectedItems([]));
    }
  };

  const renderForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__("Add Branch")}
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form
        closeModal={closeModal}
        queryType="branches"
        additionalRefetchQueries={refetchQueries()}
      />
    );

    return (
      <ModalTrigger title="Add Branch" content={content} trigger={trigger} />
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
      <FilterContainer $marginRight={true}>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FormControl
            type="text"
            placeholder={__("Type to search")}
            onChange={search}
            value={searchValue}
            autoFocus={true}
            onFocus={moveCursorAtTheEnd}
          />
        </InputBar>
      </FilterContainer>
    );
  };

  const renderRow = (branch: IBranch, level) => {
    const handleSelect = () => {
      if (selectedItems.includes(branch._id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== branch._id
        );
        return setSelectedItems(removedSelectedItems);
      }
      setSelectedItems([...selectedItems, branch._id]);
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
      <tr key={branch._id}>
        <td onClick={onclick}>
          <FormControl
            componentclass="checkbox"
            checked={selectedItems.includes(branch._id)}
            onClick={handleSelect}
          />
        </td>
        <td>{__(`${"\u00A0 \u00A0 ".repeat(level)}  ${branch.code}`)}</td>
        <td>{__(branch.title)}</td>
        <td>{branch?.parent?.title || ""}</td>
        <td>{__(branch.address.replace(/\n/g, ""))}</td>
        <td>{branch.userCount}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              key={branch._id}
              title="Edit Branch"
              content={({ closeModal }) => (
                <Form
                  item={branch}
                  queryType="branches"
                  closeModal={closeModal}
                  additionalRefetchQueries={refetchQueries()}
                />
              )}
              trigger={trigger}
            />
            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={() => remove(branch._id)}
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
    const branches = listQuery?.branchesMain?.list || [];

    const handleSelectAll = () => {
      if (!selectedItems.length) {
        const branchIds = branches.map((branch) => branch._id);
        return setSelectedItems(branchIds);
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
                checked={branches?.length === selectedItems.length}
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
          {generateTree(branches, null, (branch, level) =>
            renderRow(branch, level)
          )}
          {generateTree(branches, "", (branch, level) =>
            renderRow(branch, level)
          )}
        </tbody>
      </Table>
    );
  };

  const { listQuery } = props;
  const { totalCount } = listQuery.branchesMain;

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
          title="Branches"
          breadcrumb={[
            { title: __("Settings"), link: "/settings" },
            { title: __("Branches") },
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={
            <LeftActionBar>
              <Title $capitalize={true}>
                {__("Branches")}&nbsp;
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
