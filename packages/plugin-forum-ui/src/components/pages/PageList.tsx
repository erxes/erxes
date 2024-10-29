import { Alert, __, confirm, router as routerUtils } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { EMPTY_CONTENT_FORUMS } from "@erxes/ui-settings/src/constants";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import { Flex } from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IPage } from "../../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import PageForm from "./PageForm";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./Row";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  pages: IPage[];
  queryParams?: any;
  loading?: boolean;
  remove?: (pageId: string, emptyBulk?: () => void) => void;
  refetch?: () => void;
  emptyBulk: () => void;
  bulk: any[];
  totalCount: number;
  isAllSelected: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  toggleBulk: (target: IPage, toAdd: boolean) => void;
  toggleAll: (targets: IPage[], containerId: string) => void;
};

const List = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, remove, bulk, toggleBulk, renderButton } = props;

  const renderRow = () => {
    return pages.map((page) => (
      <Row
        key={page._id}
        page={page}
        isChecked={bulk.includes(page)}
        toggleBulk={toggleBulk}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  const renderForm = (props) => {
    return <PageForm {...props} renderButton={renderButton} />;
  };

  const searchHandler = (event) => {
    routerUtils.setParams(navigate, location, { search: event.target.value });
  };

  const { totalCount, loading, isAllSelected, toggleAll, emptyBulk } = props;

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () => {
      confirm("Are you sure? This cannot be undone.")
        .then(() => {
          remove && bulk.map((item) => remove(item._id, emptyBulk));
          Alert.success("You successfully deleted a page");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    actionBarLeft = (
      <Button
        btnStyle="danger"
        size="small"
        icon="times-circle"
        onClick={onClick}
      >
        Delete
      </Button>
    );
  }

  const actionBarRight = (
    <Flex>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={searchHandler}
        value={routerUtils.getParam(location, "search")}
      />
      &nbsp;&nbsp;
      <ModalTrigger
        title={__("Create New Page")}
        size="lg"
        trigger={
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create New Page
          </Button>
        }
        content={renderForm}
      />
    </Flex>
  );

  const onChange = () => {
    toggleAll(pages, "pages");
  };

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  const content = (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={"title"} label={__("Title")} />
          </th>
          <th>{__("Code")}</th>
          <th>
            <SortHandler sortField={"listOrder"} label={__("List Order")} />
          </th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const submenu = [
    { title: __("Posts"), link: "/forums/posts" },
    { title: __("Pages"), link: "/forums/pages" },
    { title:__("Quiz"), link: "/forums/quizzes" },
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__("Pages")} submenu={submenu} />}
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading || false}
          count={pages.length}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_FORUMS} maxItemWidth="360px" />
          }
        />
      }
      hasBorder={true}
    />
  );
};

export default List;
