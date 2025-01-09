import { BranchesMainQueryResponse, IBranch } from "@erxes/ui/src/team/types";
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
import React, { useEffect, useState } from "react";
import SettingsSideBar from "../../containers/common/SettingSideBar";
import SidebarHeader from "@erxes/ui-settings/src/common/components/SidebarHeader";
import Table from "modules/common/components/table";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "modules/layout/components/Wrapper";
import {
  generatePaginationParams,
  removeParams,
  setParams,
} from "@erxes/ui/src/utils/router";
import { generateTree } from "../../utils";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui/src/team/graphql";
import client from "@erxes/ui/src/apolloClient";
import { useLocation, useNavigate } from "react-router-dom";
import WorkhourForm from "../WorkhourForm";

type Props = {
  listQuery: BranchesMainQueryResponse;
  deleteBranches: (ids: string[], callback: () => void) => void;
  queryParams: Record<string, string>;
};

const generateBreadcrumb = async ({ parentId }, arr: any[] = []) => {
  if (parentId) {
    const query = `
      query branchDetail ($_id:String!) {
        branchDetail(_id: $_id) {
          _id,
          title,
          parentId
        }
      }
    `;

    const { data } = await client.query({
      query: gql(query),
      fetchPolicy: "network-only",
      variables: { _id: parentId },
    });

    const branch = data?.branchDetail;

    if (branch) {
      // Add the current branch to the breadcrumb array
      arr = [
        {
          title: __(branch.title),
          link: `/settings/branches?parentId=${branch._id}`,
        },
        ...arr, // Add the new breadcrumb at the beginning
      ];

      // Recursively fetch parent breadcrumb if parentId exists
      if (branch.parentId) {
        return await generateBreadcrumb({ parentId: branch.parentId }, arr);
      }
    }
  }
  return arr; // Return the accumulated array when no more parents
};

const MainList = (props: Props) => {
  let timer;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [additionalBreadCrumb, setAdditionalBreadCrumb] = useState([] as any[]);
  const [searchValue, setSearchValue] = useState(
    props.queryParams.searchValue || "",
  );

  useEffect(() => {
    const fetchBreadcrumb = async () => {
      const breadcrumbs = await generateBreadcrumb({
        parentId: props.queryParams?.parentId,
      });
      setAdditionalBreadCrumb(breadcrumbs);
    };

    fetchBreadcrumb();
  }, [props.queryParams?.parentId]);

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

  const setParentId = (_id: string) => {
    setParams(navigate, location, { parentId: _id });
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

  const renderRow = (branch: IBranch, level) => {
    const handleSelect = () => {
      if (selectedItems.includes(branch._id)) {
        const removedSelectedItems = selectedItems.filter(
          (selectItem) => selectItem !== branch._id,
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
            {branch.hasChildren && (
              <Tip text={__("Display children")} placement="top">
                <Button
                  btnStyle="link"
                  onClick={() => setParentId(branch._id)}
                  icon="sitemap-1"
                />
              </Tip>
            )}
            <ModalTrigger
              title="Setup workhour of branch"
              trigger={
                <Button btnStyle="link">
                  <Tip text={__("Setup workhour")} placement="top">
                    <Icon icon="clock" />
                  </Tip>
                </Button>
              }
              content={({ closeModal }) => (
                <WorkhourForm
                  item={branch}
                  type="branch"
                  closeModal={closeModal}
                />
              )}
              size="lg"
            />
            <ModalTrigger
              key={branch._id}
              title="Edit Branch"
              content={({ closeModal }) => (
                <Form
                  itemId={branch._id}
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

    const generateList = () => {
      let list: any[] = branches.map((item) => {
        if (!branches.find((branch) => branch._id === item.parentId)) {
          return { ...item, parentId: null };
        }
        return item;
      });

      return list;
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
            <th>{__("Address")}</th>
            <th>{__("Team member count")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {generateTree(
            generateList(),
            queryParams?.parentId || null,
            (branch, level) => renderRow(branch, level),
          )}
          {generateTree(generateList(), "", (branch, level) =>
            renderRow(branch, level),
          )}
        </tbody>
      </Table>
    );
  };

  const { listQuery, queryParams } = props;
  const { totalCount } = listQuery.branchesMain;
  const onlyFirstLevel =
    queryParams.onlyFirstLevel === "true" ? undefined : true;

  const rightActionBar = (
    <BarItems>
      {!queryParams.parentId ? (
        <Button
          btnStyle="white"
          onClick={() => {
            removeParams(navigate, location, "page");
            setParams(navigate, location, { onlyFirstLevel })
          }}
        >
          {__(`${onlyFirstLevel ? "Show Only" : "Disable"} First Level`)}
        </Button>
      ) : (
        <></>
      )}

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
            { title: __("Branches"), link: "/settings/branches" },
            ...additionalBreadCrumb,
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
